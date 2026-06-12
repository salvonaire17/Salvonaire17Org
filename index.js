
import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { 
    User, Role, View, StudentDetails, LecturerDetails, Course, Department, Announcement, Hostel, ModuleNotice, AdmissionApplication, AdmittedStudent,
    ROLE_LIMITS, RegistrationWorkflow, Grade, SemesterResult, AuditLog 
} from '../types';
import { 
    users as initialUsers, 
    students as initialStudents, 
    lecturers as initialTeachers,
    courses as initialCourses,
    departments as initialDepartments,
    announcements as initialAnnouncements,
    hostels as initialHostels
} from '../data/mockData';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut as signOutFirebase, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { 
    doc, setDoc, getDoc, collection, onSnapshot, getDocs, updateDoc, query, where, deleteDoc,
    orderBy, limit, writeBatch
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export interface ClassTeacherAppointment {
    courseId: string;
    level: number; // 1, 2, 3 (NTA 4, 5, 6)
    teacherId: string;
}

type FullUser = StudentDetails | LecturerDetails | User;

interface AuthContextType {
  user: FullUser | null;
  users: FullUser[];
  students: StudentDetails[];
  lecturers: LecturerDetails[];
  courses: Course[];
  departments: Department[];
  announcements: Announcement[];
  moduleNotices: ModuleNotice[];
  hostels: Hostel[];
  classTeachers: ClassTeacherAppointment[];
  applications: AdmissionApplication[];
  auditLogs: AuditLog[];
  role: Role | null;
  staffConfirmationCode: string;
  login: (email: string, password?: string, selectedRole?: string) => Promise<void>;
  signup: (userData: { 
      name: string, 
      email: string, 
      password?: string, 
      role: Role, 
      phone: string, 
      indexNumber?: string,
      linkedStudentName?: string
  }) => Promise<void>;
  logout: () => void;
  updateStaffCode: (newCode: string) => void;
  view: View;
  setView: (view: View) => void;
  updateStudent: (studentId: string, updates: Partial<StudentDetails>) => void;
  updateUser: (userId: string, updates: Partial<FullUser>) => void;
  addStudent: (studentData: Omit<StudentDetails, 'id'>) => void;
  bulkAddStudents: (students: Partial<StudentDetails>[]) => void;
  addLecturer: (lecturerData: Omit<LecturerDetails, 'id'>) => void;
  addAnnouncement: (announcementData: Omit<Announcement, 'id'>) => void;
  deleteAnnouncement: (announcementId: string) => Promise<void>;
  addModuleNotice: (noticeData: Omit<ModuleNotice, 'id'>) => void;
  addCourse: (courseData: Omit<Course, 'id'>) => void;
  appointClassTeacher: (appointment: ClassTeacherAppointment) => void;
  submitApplication: (application: Omit<AdmissionApplication, 'id' | 'status' | 'appliedDate'>) => void;
  updateApplicationStatus: (applicationId: string, status: AdmissionApplication['status']) => void;
  promoteToHOD: (lecturerId: string, departmentId: string) => Promise<void>;
  updateRegistrationStep: (studentId: string, stage: keyof RegistrationWorkflow, data: any) => Promise<void>;
  updateStudentReportingStatus: (studentId: string, status: string, reason?: string) => Promise<void>;
  actionLoadingId: string | null;
  resetAllRegistrations: () => Promise<void>;
  purgeUnfamiliarUser: (userId: string) => Promise<void>;
  registrationData: any;
  isRegistrationLoading: boolean;
  submitRegistrationPhase1: (data: any) => Promise<void>;
  markRegistrationPaid: (department: 'bursar' | 'nhif' | 'supplies') => Promise<void>;
  submitRegistrationPhase2: (data?: any) => Promise<void>;
  allocateRoom: (studentId: string, hostel: string, room: string, block?: string) => Promise<void>;
  submitRegistrationPhase1Clearance: () => Promise<void>;
  submitRegistrationPhase2Clearance: () => Promise<void>;
  submitFinalRegistrationClearance: () => Promise<void>;
  submitGrade: (data: any, isFinal?: boolean) => Promise<void>;
  verifyGrades: (moduleId: string, studentIds: string[]) => Promise<void>;
  publishResults: (courseId: string, semester: 'SM1' | 'SM2', academicYear: string) => Promise<void>;
  grades: Grade[];
  semesterResults: SemesterResult[];
  handleTerminateAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FullUser | null>(null);
  const [view, setView] = useState<View>('landing');
  const [staffConfirmationCode, setStaffConfirmationCode] = useState('MCHAS GOOD STAFF');
  const isCreatingAccount = React.useRef(false);
  
  const [studentData, setStudentData] = useState<StudentDetails[]>(initialStudents);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [isRegistrationLoading, setIsRegistrationLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  const updateCacheTimestamp = useCallback((key: string) => {
    setLastFetched(prev => ({ ...prev, [key]: Date.now() }));
  }, []);

  const isCacheFresh = useCallback((key: string) => {
    const last = lastFetched[key];
    if (!last) return false;
    return (Date.now() - last) < 120000; // 2 minutes logic
  }, [lastFetched]);
  const [lecturerData, setLecturerData] = useState<LecturerDetails[]>(initialTeachers as any);
  const [userData, setUserData] = useState<User[]>(initialUsers);
  const [courseData, setCourseData] = useState<Course[]>(initialCourses);
  const [departmentData, setDepartmentData] = useState<Department[]>(initialDepartments);
  const [announcementData, setAnnouncementData] = useState<Announcement[]>(initialAnnouncements);
  const [moduleNotices, setModuleNotices] = useState<ModuleNotice[]>([]);
  const [hostelData, setHostelData] = useState<Hostel[]>(initialHostels);
  const [classTeachers, setClassTeachers] = useState<ClassTeacherAppointment[]>([]);
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [semesterResults, setSemesterResults] = useState<SemesterResult[]>([]);

  const allUsers = useMemo(() => [...studentData, ...lecturerData, ...userData].map(u => ({...u, isProfileComplete: u.isProfileComplete ?? true})), [studentData, lecturerData, userData]);

  useEffect(() => {
    let unsubUserDoc: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (userCred) => {
        if (unsubUserDoc) {
            unsubUserDoc();
            unsubUserDoc = null;
        }

        if (userCred) {
            try {
                const docRef = doc(db, 'users', userCred.uid);
                unsubUserDoc = onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const userDataInfo = docSnap.data() as FullUser;
                        setCurrentUser(userDataInfo);
                        if (!isCreatingAccount.current) {
                            if (!userDataInfo.isProfileComplete) {
                                setView('complete-profile');
                            } else {
                                setView(currentView => {
                                    if (currentView === 'landing' || currentView === 'complete-profile' || currentView === 'login') {
                                        return 'dashboard';
                                    }
                                    return currentView;
                                });
                            }
                        }
                    } else if (!isCreatingAccount.current) {
                        // Check if the auth user was created very recently (within last 15 seconds) to prevent signup race conditions
                        const creationTimeStr = userCred.metadata.creationTime;
                        const isVeryRecent = creationTimeStr ? (Date.now() - new Date(creationTimeStr).getTime() < 15000) : false;
                        
                        if (!isVeryRecent) {
                            // Document deleted in Firestore / Firebase directly!
                            console.log("Current user's firestore document was deleted or not found. Logging out.");
                            setCurrentUser(null);
                            setView('landing');
                            signOutFirebase(auth).catch(err => console.error("Error signing out empty user:", err));
                        } else {
                            console.log("Skipping empty firestore document logout for very recently created account.");
                        }
                    }
                }, (err) => {
                    console.error("Error with current user doc listener:", err);
                });
            } catch (err) {
                console.error("Error fetching user data from Firestore:", err);
            }
        } else {
            setCurrentUser(null);
            setView('landing');
        }
    });

    return () => {
        unsubAuth();
        if (unsubUserDoc) unsubUserDoc();
    };
  }, []);

  // Registration Data Listener for Students
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'Student') {
        setRegistrationData(null);
        return;
    }

    setIsRegistrationLoading(true);
    const regRef = doc(db, 'registrations', currentUser.id);
    const unsubReg = onSnapshot(regRef, (docSnap) => {
        console.log("Registration listener, doc exists:", docSnap.exists(), "regRef id:", regRef.id);
        if (docSnap.exists()) {
            setRegistrationData(docSnap.data());
        } else {
            setRegistrationData(null);
        }
        setIsRegistrationLoading(false);
    }, (err) => {
        console.error("Registration data listener error:", err);
        setIsRegistrationLoading(false);
    });

    return () => unsubReg();
  }, [currentUser?.id, currentUser?.role]);

  const submitRegistrationPhase1 = async (formData: any) => {
    if (!currentUser) return;
    const payload = {
        studentDetails: { ...formData },
        workflowState: { currentPhase: 1, globalStatus: "SUBMITTED_WAITING_FOR_ADMISSION" },
        phase1: {
            admission: { status: "PENDING" },
            bursar: { status: "PENDING", controlNumber: "", studentMarkedPaid: false },
            nhif: { status: "PENDING", controlNumber: "", studentMarkedPaid: false },
            supplies: { status: "PENDING" }
        },
        phase2: {
            hod: { status: "PENDING" },
            warden: { status: "PENDING" },
            secretary: { status: "PENDING" },
            vicePrincipal: { status: "PENDING" }
        },
        lastUpdatedAt: new Date().toISOString()
    };
    
    const batch = writeBatch(db);
    batch.set(doc(db, 'registrations', currentUser.id), payload);
    batch.update(doc(db, 'users', currentUser.id), {
        courseId: formData.course || currentUser.courseId || '',
        level: formData.level || (currentUser as any).level || '',
        indexNumber: formData.registrationNumber || (currentUser as any).indexNumber || '',
        nactvetRegNo: formData.registrationNumber || (currentUser as any).nactvetRegNo || ''
    });
    
    await batch.commit();
    toast.success("Registration Phase 1 Dispatched!");
  };

  const markRegistrationPaid = async (department: 'bursar' | 'nhif' | 'supplies') => {
    if (!currentUser) return;
    await updateDoc(doc(db, 'registrations', currentUser.id), {
        [`phase1.${department}.studentMarkedPaid`]: true,
        [`phase1.${department}.status`]: "PENDING_OFFICER_CONFIRMATION",
        lastUpdatedAt: new Date().toISOString()
    });
    toast.success("Payment / Requirements marked. Awaiting confirmation.");
  };

  const submitRegistrationPhase2 = async (data: any = {}) => {
    if (!currentUser) return;
    await setDoc(doc(db, 'registrations', currentUser.id), {
        workflowState: {
            currentPhase: 2,
            globalStatus: 'PHASE1_CLEARED_PENDING_PHASE2'
        },
        phase2Data: data,
        phase2: {
            departmental_clearance: data,
            hod: { status: 'Pending HOD Review' },
            warden: { status: 'PENDING' },
            secretary: { status: 'PENDING' },
            vicePrincipal: { status: 'PENDING' }
        },
        lastUpdatedAt: new Date().toISOString()
    }, { merge: true });
    toast.success("Phase 2 Registration Started!");
  };

  const allocateRoom = async (studentId: string, hostel: string, room: string, block?: string) => {
    const studentRef = doc(db, 'registrations', studentId);
    const userRef = doc(db, 'users', studentId);

    const updateData: any = {
        'phase2.warden.status': 'APPROVED',
        'phase2.warden.roomAssigned': room,
        'phase2.warden.hostelAssigned': hostel,
        'phase2.warden.allocatedAt': new Date().toISOString(),
    };
    if (block) updateData['phase2.warden.blockAssigned'] = block;

    await updateDoc(studentRef, updateData);
    await updateDoc(userRef, {
        hostelStatus: 'Allocated',
        hostelId: hostel,
        roomId: room,
        hostelAllocationDate: new Date().toISOString()
    });
    toast.success("Room allocated successfully!");
  };

  const submitRegistrationPhase1Clearance = async () => {};
  const submitRegistrationPhase2Clearance = async () => {};
  const submitFinalRegistrationClearance = async () => {};

  // HIGH-PERFORMANCE DATA CACHING & SYNC
  const [shallowStudentData, setShallowStudentData] = useState<any[]>([]);

  // Real-time listener for all students (for administrative and teaching staff)
  useEffect(() => {
    if (!currentUser) return;
    
    const staffRoles = ['Admin', 'Principal', 'Vice Principal', 'Admission Officer', 'Academic Officer', 'Bursar', 'Warden', 'NHIF Officer', 'Supplies Officer', 'Lecturer', 'HOD', 'Academic Registry', 'Secretary', 'System Administrator'];
    if (!staffRoles.includes(currentUser.role)) return;

    const q = query(collection(db, 'users'), where('role', '==', 'Student'));
    const unsub = onSnapshot(q, (snapshot) => {
      const studentsList: StudentDetails[] = [];
      const shallowList: any[] = [];
      
      snapshot.forEach(docSnap => {
        const fullData = { id: docSnap.id, ...docSnap.data() } as StudentDetails;
        studentsList.push(fullData);
        shallowList.push({
          id: docSnap.id,
          name: fullData.name,
          email: fullData.email,
          avatar: fullData.avatar,
          role: fullData.role,
          courseId: fullData.courseId,
          level: fullData.level,
          reportingStatus: fullData.reportingStatus,
          registrationStatus: fullData.registrationStatus,
          paymentStatus: fullData.paymentStatus,
          hostelStatus: fullData.hostelStatus
        });
      });
      
      setStudentData(studentsList);
      setShallowStudentData(shallowList);
      updateCacheTimestamp('users_list');
    }, (err) => {
      console.error("Student sync error:", err);
    });

    return () => unsub();
  }, [currentUser, db, updateCacheTimestamp]);

  const syncUsers = useCallback(async (force = false) => {
    // This is now redundant but kept for interface compatibility
    updateCacheTimestamp('users_list');
  }, [updateCacheTimestamp]);

  // Sync all lecturers and HODs from Firestore
  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, 'users'), where('role', 'in', ['Lecturer', 'HOD', 'Vice Principal', 'Principal']));
    const unsub = onSnapshot(q, (snapshot) => {
        const lecturersList: LecturerDetails[] = [];
        snapshot.forEach(docSnap => {
            lecturersList.push({ id: docSnap.id, ...docSnap.data() } as LecturerDetails);
        });
        setLecturerData(lecturersList);
    }, (err) => {
        console.error("Error syncing lecturers:", err);
    });

    return () => unsub();
  }, [currentUser]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    
    const unsubscribes: (() => void)[] = [];

    // Grades
    let gradesQuery;
    if (currentUser.role === 'Student') {
        gradesQuery = query(collection(db, 'grades'), where('studentId', '==', currentUser.id));
    } else if (currentUser.role === 'Parent') {
        const studentId = (currentUser as any).linkedStudentId;
        gradesQuery = query(collection(db, 'grades'), where('studentId', '==', studentId));
    } else {
        gradesQuery = collection(db, 'grades');
    }
    
    const unsubGrades = onSnapshot(gradesQuery, (snapshot) => {
        const list: Grade[] = [];
        snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Grade));
        setGrades(list);
    }, (error) => {
        console.warn("Grades snapshot error:", error.message);
    });
    unsubscribes.push(unsubGrades);

    // Semester Results
    let resultsQuery;
    if (currentUser.role === 'Student') {
        resultsQuery = query(collection(db, 'semester_results'), where('studentId', '==', currentUser.id));
    } else if (currentUser.role === 'Parent') {
        const studentId = (currentUser as any).linkedStudentId;
        resultsQuery = query(collection(db, 'semester_results'), where('studentId', '==', studentId));
    } else {
        resultsQuery = collection(db, 'semester_results');
    }

    const unsubSemResults = onSnapshot(resultsQuery, (snapshot) => {
        const list: SemesterResult[] = [];
        snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as SemesterResult));
        setSemesterResults(list);
    }, (error) => {
        console.warn("Semester results snapshot error:", error.message);
    });
    unsubscribes.push(unsubSemResults);

    // Audit Logs (Only for Admin/System Administrator)
    if (['Admin', 'System Administrator'].includes(currentUser.role)) {
        const unsubAudit = onSnapshot(collection(db, 'audit_logs'), (snapshot) => {
            const list: AuditLog[] = [];
            snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as AuditLog));
            list.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setAuditLogs(list);
        }, (error) => {
            console.warn("Audit logs snapshot error:", error.message);
        });
        unsubscribes.push(unsubAudit);
    }
    
    return () => {
        unsubscribes.forEach(unsub => unsub());
    };
  }, [currentUser?.id, currentUser?.role, (currentUser as any)?.linkedStudentId]);

  // Presence heartbeat tracking to see who is utilizing the app in real-time
  useEffect(() => {
    if (!currentUser?.id) return;

    const updatePresence = async (online: boolean) => {
        try {
            await updateDoc(doc(db, 'users', currentUser.id), {
                isOnline: online,
                lastActive: new Date().toISOString()
            });
        } catch (e) {
            console.error("Failed to update active presence status in Firebase:", e);
        }
    };

    updatePresence(true);

    const interval = setInterval(() => {
        updatePresence(true);
    }, 25000);

    const handleUnload = () => {
        updateDoc(doc(db, 'users', currentUser.id), {
            isOnline: false,
            lastActive: new Date().toISOString()
        });
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
        clearInterval(interval);
        window.removeEventListener('beforeunload', handleUnload);
        updateDoc(doc(db, 'users', currentUser.id), {
            isOnline: false,
            lastActive: new Date().toISOString()
        }).catch(() => {});
    };
  }, [currentUser?.id]);

  const login = async (emailOrRegNo: string, passwordOrName: string, selectedRole?: string): Promise<void> => {
    if (!passwordOrName) throw new Error("Password required");
    const userCredential = await signInWithEmailAndPassword(auth, emailOrRegNo, passwordOrName);
    
    if (selectedRole) {
        // Fetch user from firestore to check role
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.role !== selectedRole && !(userData.role === 'HOD' && selectedRole === 'Lecturer')) {
                await auth.signOut();
                throw new Error('Wrong role');
            }
        }
    }
  };

  const updateStaffCode = (newCode: string) => {
    setStaffConfirmationCode(newCode);
  };

  const signup = async (data: { 
      name: string, 
      email: string, 
      password?: string, 
      role: Role, 
      phone: string, 
      indexNumber?: string,
      linkedStudentName?: string
  }): Promise<void> => {
    if (!data.password) throw new Error("Password required");
    if (!data.phone) throw new Error("Phone number is required for account creation.");

    // Validation for three full names as requested by user
    const nameParts = data.name.trim().split(/\s+/);
    if (nameParts.length < 3) {
        throw new Error("Full Registration Requirement: You must provide your three full official names (First, Middle, and Surname) as they appear in official records for identity matching.");
    }

    let finalCourseId = "";
    let finalWorkflow: any = null;
    let officialName = data.name;

    // 1. PRE-AUTH VALIDATIONS (Checks that don't require registration yet)
    
    if (data.role === 'HOD') {
        throw new Error("HOD roles cannot be self-assigned. Please register as a Lecturer and request appointment through the Principal's dashboard.");
    }

    if (data.role === 'Student') {
        const indexNum = data.indexNumber?.trim();
        if (!indexNum) {
            throw new Error("Student Index Number / Registration Number is required for identity verification.");
        }

        finalWorkflow = {
            indexNumber: indexNum,
            status: 'pending_admission',
            currentStep: 1,
            admission: { status: 'pending' }
        };
    }

    isCreatingAccount.current = true;
    let newUserToPersist: any;

    try {
        // 2. CREATE AUTH USER
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const newId = userCredential.user.uid;

        const isPermissionOrIndexError = (err: any): boolean => {
            if (!err) return false;
            const msg = (err.message || "").toLowerCase();
            const code = (err.code || "").toLowerCase();
            return msg.includes('permission') || msg.includes('denied') || msg.includes('unauthorized') || msg.includes('index') ||
                   code.includes('permission') || code.includes('denied') || code.includes('unauthorized') || code.includes('index');
        };

        const cleanupOnFailure = async (errorMsg: string) => {
            try {
                // Use the instance from the credential which is fresh
                await deleteUser(userCredential.user);
            } catch (e: any) {
                if (e.message?.includes('auth/user-token-expired') || e.message?.includes('auth/requires-recent-login') || e.code?.includes('user-token-expired')) {
                    try {
                        const credential = EmailAuthProvider.credential(data.email, data.password);
                        await reauthenticateWithCredential(userCredential.user, credential);
                        await deleteUser(userCredential.user);
                    } catch (reauthErr) {
                         console.warn("Soft cleanup notification during auth rollback (token expired):", e);
                         await auth.signOut();
                    }
                } else {
                    console.warn("Soft cleanup auth rollback warning:", e);
                    await auth.signOut();
                }
            }
            isCreatingAccount.current = false;
            throw new Error(errorMsg);
        };

        // 3. POST-AUTH VALIDATIONS (Checks that require authentication)

    // Role limits check - non-blocking if permission/index issue occurs
    if (ROLE_LIMITS[data.role]) {
        try {
            const q = query(collection(db, 'users'), where('role', '==', data.role));
            const snap = await getDocs(q);
            if (snap.size >= ROLE_LIMITS[data.role]) {
                await cleanupOnFailure(`Authorization Limit Reached: The college already has the maximum number of ${data.role}s (${ROLE_LIMITS[data.role]}).`);
            }
        } catch (err: any) {
            // Log but don't fail registration for limit checks if DB throws permission/index errors
            console.warn("Soft-failure on role limit check:", err);
            if (!isPermissionOrIndexError(err)) {
                await cleanupOnFailure(err.message || "Validation failed during signup.");
            }
        }
    }

    if (data.role === 'Student') {
        try {
            const indexNum = data.indexNumber!.trim();
            // 2b. Double check if student account exists with that index
            const qRegistered = query(collection(db, 'users'), where('registrationWorkflow.indexNumber', '==', indexNum));
            const snapRegistered = await getDocs(qRegistered);
            if (!snapRegistered.empty) {
                await cleanupOnFailure(`Profile Duplicate Checked: Index number "${indexNum}" has already registered an active profile.`);
            }
        } catch (err: any) {
            console.warn("Soft-failure on duplicate profile check:", err);
            // If it's a permission/index error, we proceed and rely on the fact that duplicate index numbers shouldn't happen naturally
            if (!isPermissionOrIndexError(err)) {
                 await cleanupOnFailure(err.message || "Duplicate check failed.");
            }
        }
    }

    // 4. PERSIST TO FIRESTORE
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(officialName)}`;
    
    if (data.role === 'Student') {
        const student: StudentDetails = {
            id: newId,
            name: officialName,
            email: data.email,
            password: "",
            role: 'Student',
            avatar: avatar,
            phone: data.phone,
            level: 'NTA 4',
            balanceDue: 0,
            registrationStatus: 'Unregistered',
            reportingStatus: 'Pending',
            grades: [],
            paymentStatus: 'Pending',
            nhifStatus: 'Inactive',
            heslbStatus: 'Not Loaned',
            hostelStatus: 'Pending',
            attendance: [],
            courseId: finalCourseId,
            isProfileComplete: false, // Forces user to complete profile step
            registrationWorkflow: finalWorkflow
        };
        newUserToPersist = student;
    } else if (['Lecturer', 'HOD', 'Principal', 'Vice Principal', 'Warden', 'Bursar', 'Admission Officer', 'Admin', 'Academic Officer', 'System Administrator', 'Supplies Officer'].includes(data.role)) {
        const lecturer: LecturerDetails = {
            id: newId,
            name: data.name,
            email: data.email,
            password: "",
            role: data.role as any,
            avatar: avatar,
            phone: data.phone,
            modules: [],
            isProfileComplete: false
        };
        newUserToPersist = lecturer;
    } else if (data.role === 'Parent') {
        const user: User = {
            id: newId,
            name: data.name,
            email: data.email,
            password: "",
            role: 'Parent',
            avatar: avatar,
            phone: data.phone,
            isProfileComplete: false,
            linkedStudentName: data.linkedStudentName
        };

        // Attempt to find student ID by name if provided
        if (data.linkedStudentName) {
            try {
                const studentsRef = collection(db, 'users');
                const q = query(studentsRef, where('role', '==', 'Student'), where('name', '==', data.linkedStudentName));
                const snap = await getDocs(q);
                if (!snap.empty) {
                    user.linkedStudentId = snap.docs[0].id;
                }
            } catch (err) {
                console.error("Error finding student for parent:", err);
            }
        }
        newUserToPersist = user;
    } else {
        const user: User = {
            id: newId,
            name: data.name,
            email: data.email,
            password: "",
            role: data.role,
            avatar: avatar,
            phone: data.phone,
            isProfileComplete: false
        };
        newUserToPersist = user;
    }
    
    try {
        await setDoc(doc(db, "users", newId), newUserToPersist);
    } catch (err: any) {
        await cleanupOnFailure(err.message || "Institutional identity synchronization failed. Please try again.");
    }

    isCreatingAccount.current = false;
    setCurrentUser(newUserToPersist);
    if (!newUserToPersist.isProfileComplete) {
        setView('complete-profile');
    } else {
        setView('dashboard');
    }
  } catch (err) {
    isCreatingAccount.current = false;
    throw err;
  }
  };

  const logout = useCallback(() => {
    signOutFirebase(auth).then(() => {
        setCurrentUser(null);
        setView('landing');
    });
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        toast.error('You have been logged out due to 15 minutes of inactivity.', { duration: 5000 });
        logout();
      }, 900000); // 15 minutes
    };

    const handleActivity = () => {
      resetTimer();
    };

    resetTimer();

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }));

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [currentUser, logout]);

  const handleTerminateAccount = useCallback(async (): Promise<void> => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
        throw new Error("No authenticated user found.");
    }
    const uid = firebaseUser.uid;
    
    const terminationPromise = (async () => {
        // 1. Delete Firestore user document
        const userDocRef = doc(db, 'users', uid);
        await deleteDoc(userDocRef);

        // Optional: delete registration if it exists
        const regDocRef = doc(db, 'registrations', uid);
        await deleteDoc(regDocRef).catch(() => {});

        // 2. Delete auth user from Firebase Auth
        await deleteUser(firebaseUser);
        
        // Finalize state
        setRegistrationData(null);
        setCurrentUser(null);
        setView('landing');
    })();

    toast.promise(terminationPromise, {
        loading: 'Terminating account...',
        success: 'Account permanently removed. Handing over to exit workflow.',
        error: 'Security re-authentication required or termination failed.'
    });

    try {
        await terminationPromise;
    } catch (err) {
        // Sensitive operation requires recent login
        await signOutFirebase(auth);
        window.location.reload();
    }
  }, [db]);

  const purgeUnfamiliarUser = useCallback(async (userId: string): Promise<void> => {
      if (!currentUser || !['Admin', 'Principal', 'Vice Principal', 'Admission Officer'].includes(currentUser.role)) {
          throw new Error("Unauthorized: Only administrative staff can purge accounts.");
      }

      const userDocRef = doc(db, 'users', userId);
      try {
          await deleteDoc(userDocRef);
          setStudentData(prev => prev.filter(s => s.id !== userId));
          setLecturerData(prev => prev.filter(l => l.id !== userId));
          setUserData(prev => prev.filter(u => u.id !== userId));
          setShallowStudentData(prev => prev.filter(s => s.id !== userId));
          toast.success("User account purged from systems.");
      } catch (err: any) {
          console.error("Purge failed:", err);
          toast.error("Network synchronization failed during purge.");
      }
  }, [currentUser, db]);

  const resetAllRegistrations = useCallback(async (): Promise<void> => {
    if (!currentUser || !['Admin', 'Principal', 'Vice Principal', 'Admission Officer'].includes(currentUser.role)) {
        throw new Error("Unauthorized: Only administrative staff can reset registration cycles.");
    }

    setIsLoading(true);
    try {
        // 1. Reset 'users' collection (where role is Student)
        const studentsRef = collection(db, 'users');
        const q = query(studentsRef, where('role', '==', 'Student'));
        const snapshot = await getDocs(q);
        
        const batch: Promise<void>[] = [];
        snapshot.forEach(docSnap => {
            batch.push(updateDoc(doc(db, 'users', docSnap.id), {
                registrationStatus: 'Unregistered',
                reportingStatus: 'Pending',
                reportingDate: null,
                reviewedBy: null,
                rejectionReason: null,
                registrationWorkflow: {
                    status: 'pending_admission',
                    currentStep: 1,
                    admission: { status: 'pending' },
                    lastUpdatedAt: new Date().toISOString()
                },
                isProfileComplete: true 
            }));
        });

        // 2. Clear out the 'registrations' collection (if used by RegistrationView)
        const regsRef = collection(db, 'registrations');
        const regsSnapshot = await getDocs(regsRef);
        regsSnapshot.forEach(docSnap => {
            batch.push(deleteDoc(doc(db, 'registrations', docSnap.id)));
        });

        // 3. Optional: Clear reporting logs to completely "start over"
        const logsRef = collection(db, 'reportingLogs');
        const logsSnapshot = await getDocs(logsRef);
        logsSnapshot.forEach(docSnap => {
            batch.push(deleteDoc(doc(db, 'reportingLogs', docSnap.id)));
        });

        await Promise.all(batch);

        // 4. Create a Global Notification for Students
        try {
            const announcementRef = doc(collection(db, 'announcements'));
            await setDoc(announcementRef, {
                id: announcementRef.id,
                title: "🔴 REGISTRATION CYCLE RESET",
                content: "Attention all students: A new registration cycle has been initiated. All previous registration clearances have been reset. Please restart your registration process from Step 1 (Reporting) immediately.",
                type: 'Alert',
                date: new Date().toISOString(),
                author: currentUser?.name || 'Academic Office',
                targetRoles: ['Student'],
                isUrgent: true,
                priority: 'High'
            });
        } catch (annError) {
            console.error("Failed to post reset announcement:", annError);
        }

        // 5. UPDATE LOCAL STATE IMMEDIATELY for instant UI feedback (Zero out counts)
        setStudentData(prev => prev.map(s => {
            if (s.role !== 'Student') return s;
            return {
                ...s,
                registrationStatus: 'Unregistered',
                reportingStatus: 'Pending',
                reportingDate: null,
                reviewedBy: null,
                rejectionReason: null,
                registrationWorkflow: {
                    status: 'pending_admission',
                    currentStep: 1,
                    admission: { status: 'pending' },
                    lastUpdatedAt: new Date().toISOString()
                }
            };
        }));

        setShallowStudentData(prev => prev.map(s => {
            if (s.role !== 'Student') return s;
            return {
                ...s,
                registrationStatus: 'Unregistered',
                reportingStatus: 'Pending'
            };
        }));

        toast.success(`System Reset Complete. ${snapshot.size} student records initialized.`);
        
        // Refresh full data from source
        syncUsers(true);
    } catch (err: any) {
        console.error("Global reset error:", err);
        toast.error("Failed to reset registration cycle.");
    } finally {
        setIsLoading(false);
    }
  }, [currentUser, db, syncUsers]);

  const updateStudent = useCallback(async (studentId: string, updates: Partial<StudentDetails>) => {
      setStudentData(prevStudents => 
        prevStudents.map(student => 
            student.id === studentId ? { ...student, ...updates } : student
        )
      );
      
      const isStaff = currentUser && ['Admin', 'Principal', 'Vice Principal', 'HOD', 'Admission Officer', 'Bursar', 'Warden', 'Secretary', 'Supplies Officer'].includes(currentUser.role);
      
      if (currentUser?.id === studentId || isStaff) {
          if (currentUser?.id === studentId) {
              setCurrentUser(prev => prev ? {...prev, ...updates} : null);
          }
          try {
              await updateDoc(doc(db, 'users', studentId), updates);
          } catch (e) {
              console.error("Failed to update user in Firestore", e);
              throw e;
          }
      }
  }, [currentUser]);

  const updateUser = useCallback(async (userId: string, updates: Partial<FullUser>) => {
      // 1. OPTIMISTIC UPDATE: Immediate UI transition
      let previousStudents = [...studentData];
      let previousLecturers = [...lecturerData];
      let previousUsers = [...userData];
      let previousCurrentUser = currentUser ? {...currentUser} : null;

      const updater = (user: FullUser) => user.id === userId ? { ...user, ...updates } : user;
      
      setStudentData(prev => prev.map(s => updater(s) as StudentDetails));
      setLecturerData(prev => prev.map(t => updater(t) as LecturerDetails));
      setUserData(prev => prev.map(u => updater(u) as User));
      setShallowStudentData(prev => prev.map(s => s.id === userId ? { ...s, ...updates } : s));

      if (currentUser?.id === userId) {
          setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
      }

      // 2. ASYNC PERSISTENCE
      try {
          if (updates.role) {
              const userDoc = await getDoc(doc(db, 'users', userId));
              const currentData = userDoc.exists() ? userDoc.data() as FullUser : null;

              if (ROLE_LIMITS[updates.role]) {
                  const q = query(collection(db, 'users'), where('role', '==', updates.role));
                  const snap = await getDocs(q);
                  const currentWithRole = snap.docs.filter(d => d.id !== userId);
                  
                  if (currentWithRole.length >= ROLE_LIMITS[updates.role]) {
                      throw new Error(`Role Limit Reached: The college already has ${currentWithRole.length} ${updates.role}(s). Max limit is ${ROLE_LIMITS[updates.role]}.`);
                  }
              }

              if (updates.role === 'HOD') {
                  const targetCourseId = updates.courseId || currentData?.courseId;
                  const targetDeptId = updates.departmentId || currentData?.departmentId;

                  if (targetCourseId) {
                      const q = query(collection(db, 'users'), where('role', '==', 'HOD'), where('courseId', '==', targetCourseId));
                      const snap = await getDocs(q);
                      const currentWithRole = snap.docs.filter(d => d.id !== userId);
                      if (currentWithRole.length >= 1) {
                          throw new Error(`Course Limit Reached: This course already has an assigned HOD.`);
                      }
                  }

                  if (targetDeptId) {
                      const q = query(collection(db, 'users'), where('role', '==', 'HOD'), where('departmentId', '==', targetDeptId));
                      const snap = await getDocs(q);
                      const currentWithRole = snap.docs.filter(d => d.id !== userId);
                      if (currentWithRole.length >= 1) {
                          throw new Error(`Department Limit Reached: This department already has an assigned HOD.`);
                      }
                  }
              }
          }

          const isStaff = currentUser && ['Admin', 'Principal', 'Vice Principal', 'HOD', 'Admission Officer', 'Bursar', 'Warden', 'Secretary', 'Academic Officer', 'System Administrator', 'NHIF Officer', 'Supplies Officer'].includes(currentUser.role);

          if (currentUser?.id === userId || isStaff) {
              await updateDoc(doc(db, 'users', userId), updates);
          }
      } catch (err: any) {
          // 3. ROLLBACK ON ERROR
          console.error("Firestore update failed. Rolling back optimistic state.", err);
          setStudentData(previousStudents);
          setLecturerData(previousLecturers);
          setUserData(previousUsers);
          setCurrentUser(previousCurrentUser);
          toast.error(err.message || "Failed to update record in database.");
      }
  }, [currentUser, studentData, lecturerData, userData, db]);

  const addStudent = useCallback((student: Omit<StudentDetails, 'id'>) => {
    const newStudent: StudentDetails = { ...student, id: `S${String(studentData.length + 10).padStart(2, '0')}` };
    setStudentData(prev => [...prev, newStudent]);
  }, [studentData.length]);

  const bulkAddStudents = useCallback((students: Partial<StudentDetails>[]) => {
      setStudentData(prev => {
          const updated = [...prev];
          students.forEach(s => {
              if (!s.id) return;
              const idx = updated.findIndex(existing => existing.id === s.id);
              if (idx > -1) {
                  updated[idx] = { ...updated[idx], ...s };
              } else {
                  // Create new if doesn't exist
                  updated.push({
                      id: s.id,
                      name: s.name || 'New Student',
                      email: s.email || `${s.id.toLowerCase()}@student.udsm.ac.tz`,
                      role: 'Student',
                      avatar: `https://i.pravatar.cc/150?u=${s.id}`,
                      phone: s.phone || '',
                      level: s.level || 'NTA 4',
                      currentSemester: s.currentSemester || 'SM1',
                      registrationStatus: 'Registered',
                      grades: [],
                      paymentStatus: 'Pending',
                      balanceDue: s.balanceDue || 0,
                      nhifStatus: 'Inactive',
                      heslbStatus: 'Not Loaned',
                      hostelStatus: 'Pending',
                      attendance: [],
                      courseId: s.courseId,
                      departmentId: s.departmentId,
                      isProfileComplete: true
                  });
              }
          });
          return updated;
      });
  }, []);

  const addLecturer = useCallback((lecturer: Omit<LecturerDetails, 'id'>) => {
    const newLecturer: LecturerDetails = { ...lecturer, id: `L${String(lecturerData.length + 10).padStart(2, '0')}` };
    setLecturerData(prev => [...prev, newLecturer]);
  }, [lecturerData.length]);
  
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return; // only subscribe if logged in
    const unsub = onSnapshot(collection(db, 'announcements'), (snapshot) => {
        const anns: Announcement[] = [];
        snapshot.forEach(doc => {
            anns.push(doc.data() as Announcement);
        });
        anns.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAnnouncementData(anns);
    }, (error) => {
        console.error("Announcements snapshot error", error);
    });
    return () => unsub();
  }, [currentUser?.id, currentUser?.role]);

  const addAnnouncement = useCallback(async (announcement: Omit<Announcement, 'id'>) => {
    try {
        const docRef = doc(collection(db, 'announcements'));
        const newAnnouncement: any = { 
            ...announcement, 
            id: docRef.id,
            publisherUid: auth.currentUser?.uid // Key requirement for security rules
        };
        // Remove undefined fields to prevent Firebase errors
        Object.keys(newAnnouncement).forEach(key => {
            if (newAnnouncement[key] === undefined) {
                delete newAnnouncement[key];
            }
        });
        await setDoc(docRef, newAnnouncement);
    } catch (e) {
        console.error("Failed to add announcement", e);
    }
  }, []);

  const deleteAnnouncement = useCallback(async (announcementId: string) => {
    try {
        await deleteDoc(doc(db, 'announcements', announcementId));
        // Optimistic UI cleanup
        setAnnouncementData(prev => prev.filter(a => a.id !== announcementId));
    } catch (e) {
        console.error("Failed to delete announcement", e);
        throw e;
    }
  }, []);

  const filteredAnnouncements = useMemo(() => {
    if (!currentUser) return [];

    return announcementData.filter(ann => {
        // 1. Role Check
        if (ann.targetRoles && ann.targetRoles.length > 0) {
            if (!ann.targetRoles.includes(currentUser.role)) {
                return false;
            }
        }

        // 2. Student-specific Course/Year Filters
        // We only apply these if the user is a student AND the announcement is intended for them
        if (currentUser.role === 'Student') {
            const student = currentUser as StudentDetails;
            const matchesCourse = !ann.targetCourses || ann.targetCourses.length === 0 || (student.courseId && ann.targetCourses.includes(student.courseId));
            const matchesYear = !ann.targetYears || ann.targetYears.length === 0 || (student.level && ann.targetYears.includes(student.level as any));
            if (!matchesCourse || !matchesYear) return false;
        }

        return true;
    });
  }, [announcementData, currentUser]);

  const addModuleNotice = useCallback((notice: Omit<ModuleNotice, 'id'>) => {
    const newNotice: ModuleNotice = { ...notice, id: `MN${Math.random().toString(36).substr(2, 5).toUpperCase()}` };
    setModuleNotices(prev => [newNotice, ...prev]);
  }, []);

  const addCourse = useCallback((course: Omit<Course, 'id'>) => {
    const newCourse: Course = { ...course, id: `C${String(courseData.length + 10).padStart(2, '0')}` };
    setCourseData(prev => [...prev, newCourse]);
  }, [courseData.length]);

  const appointClassTeacher = useCallback((appointment: ClassTeacherAppointment) => {
    setClassTeachers(prev => {
        const filtered = prev.filter(a => !(a.courseId === appointment.courseId && a.level === appointment.level));
        return [...filtered, appointment];
    });
  }, []);

  const submitApplication = useCallback((appData: Omit<AdmissionApplication, 'id' | 'status' | 'appliedDate'>) => {
    const newApp: AdmissionApplication = {
      ...appData,
      id: `APP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: 'Pending',
      appliedDate: new Date().toISOString(),
    };
    setApplications(prev => [newApp, ...prev]);
  }, []);

  const updateApplicationStatus = useCallback((applicationId: string, status: AdmissionApplication['status']) => {
    setApplications(prev => prev.map(app => app.id === applicationId ? { ...app, status } : app));
  }, []);

  const promoteToHOD = useCallback(async (lecturerId: string, departmentId: string) => {
    try {
      const lecturerRef = doc(db, 'users', lecturerId);
      await updateDoc(lecturerRef, {
        role: 'HOD',
        departmentId: departmentId,
        title: 'Head of Department'
      });
    } catch (error) {
      console.error("Error promoting to HOD:", error);
      throw error;
    }
  }, []);

  const updateRegistrationStep = useCallback(async (studentId: string, stage: keyof RegistrationWorkflow, data: any) => {
    try {
      const studentRef = doc(db, 'users', studentId);
      const studentSnap = await getDoc(studentRef);
      if (!studentSnap.exists()) return;
      
      const student = studentSnap.data() as StudentDetails;
      const workflow = { ...(student.registrationWorkflow || { status: 'pending_admission', currentStep: 1 }) } as RegistrationWorkflow;
      
      // Update the specific stage data
      (workflow as any)[stage] = { 
        ...((workflow as any)[stage] || {}), 
        ...data,
        verifiedBy: currentUser?.name || 'System',
        verifiedAt: new Date().toISOString()
      };

      // Transition Logic
      if (workflow.status === 'pending_admission' && workflow.admission?.status === 'approved') {
        workflow.status = 'pending_bursar';
        workflow.currentStep = 2;
        workflow.bursar = { status: 'pending' };
      } 
      else if (workflow.status === 'pending_bursar' && workflow.bursar?.status === 'approved') {
        workflow.status = 'pending_insurance_and_projects';
        workflow.currentStep = 3;
        workflow.insurance = { status: 'pending' };
        workflow.projects = { status: 'pending' };
      }
      else if (workflow.status === 'pending_insurance_and_projects') {
        if (workflow.insurance?.status === 'approved' && workflow.projects?.status === 'approved') {
          workflow.status = 'pending_department_and_supplies';
          workflow.currentStep = 4;
          workflow.hod = { status: 'pending' };
          workflow.supplies = { status: 'pending' };
        }
      }
      else if (workflow.status === 'pending_department_and_supplies') {
        if (workflow.hod?.status === 'approved' && workflow.supplies?.status === 'approved') {
          workflow.status = 'pending_final_clearance';
          workflow.currentStep = 5;
          workflow.warden = { status: 'pending' };
          workflow.secretary = { status: 'pending' };
          workflow.vicePrincipal = { status: 'pending' };
        }
      }
      else if (workflow.status === 'pending_final_clearance') {
        if (workflow.warden?.status === 'approved' && workflow.secretary?.status === 'approved' && (workflow.vicePrincipal?.status === 'approved' || workflow.vicePrincipal?.status === undefined)) {
          // If vicePrincipal is optional or also approved
          if (workflow.vicePrincipal?.status === 'approved') {
            workflow.status = 'fully_registered';
            workflow.currentStep = 6;
            workflow.isComplete = true;
          }
        }
      }

      workflow.lastUpdatedAt = new Date().toISOString();
      await updateDoc(studentRef, { registrationWorkflow: workflow });
      
    } catch (err) {
      console.error("Error updating registration step:", err);
      throw err;
    }
  }, [currentUser]);

  const logAction = useCallback(async (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
      try {
          const logRef = doc(collection(db, 'audit_logs'));
          const fullLog: AuditLog = {
              ...log,
              id: logRef.id,
              timestamp: new Date().toISOString()
          };
          await setDoc(logRef, fullLog);
      } catch (err) {
          console.error("Audit logging failed:", err);
      }
  }, []);

  const submitGrade = useCallback(async (data: any, isFinal: boolean = false) => {
    // 1. Prepare optimistic state
    const originalGrades = [...grades];
    try {
        const { calculateGrade } = await import('../src/utils/academicLogic');
        const totalScore = (data.caScore || 0) + (data.seScore || 0);
        const { grade, points } = calculateGrade(totalScore);
        
        const gradeId = `${data.studentId}_${data.moduleId}_${data.academicYear.replace('/', '-')}`;
        
        const newGrade: Grade = {
            ...data,
            id: gradeId,
            totalScore,
            grade,
            points,
            status: isFinal ? 'pending_hod_review' : 'draft',
            submittedBy: currentUser?.id || 'System',
            submittedAt: new Date().toISOString(),
            isLocked: isFinal
        };

        // 2. OPTIMISTIC UI update: Update local state immediately
        setGrades(prev => {
            const idx = prev.findIndex(g => g.id === gradeId);
            if (idx > -1) {
                const updated = [...prev];
                updated[idx] = newGrade;
                return updated;
            }
            return [...prev, newGrade];
        });

        // 3. BACKGROUND SYNC
        setDoc(doc(db, 'grades', gradeId), newGrade).catch(err => {
            console.error("Firestore sync failed, reverting:", err);
            setGrades(originalGrades);
        });

        // Audit logging remains bg
        logAction({
            targetId: gradeId,
            targetType: 'Grade',
            action: isFinal ? 'CREATE' : 'UPDATE',
            performedBy: currentUser?.id || 'System',
            previousValue: null,
            newValue: newGrade
        });
    } catch (e) {
        setGrades(originalGrades);
        console.error("Grade submission error:", e);
        throw e;
    }
  }, [currentUser, grades, logAction]);

  const verifyGrades = useCallback(async (moduleId: string, studentIds: string[]) => {
    const originalGrades = [...grades];
    try {
        const batch: Promise<void>[] = [];
        
        // 1. OPTIMISTIC UPDATE
        setGrades(prev => prev.map(g => {
            if (studentIds.includes(g.studentId) && g.moduleId === moduleId) {
                return {
                    ...g,
                    status: 'recommended_by_hod',
                    verifiedBy: currentUser?.id || 'System',
                    verifiedAt: new Date().toISOString()
                };
            }
            return g;
        }));

        // 2. BACKGROUND UPDATES
        studentIds.forEach(sid => {
            const grade = grades.find(g => g.studentId === sid && g.moduleId === moduleId);
            if (grade) {
                batch.push(updateDoc(doc(db, 'grades', grade.id), { 
                    status: 'recommended_by_hod',
                    verifiedBy: currentUser?.id || 'System',
                    verifiedAt: new Date().toISOString()
                }));
            }
        });
        
        Promise.all(batch).catch(err => {
            console.error("Verification sync failed, reverting:", err);
            setGrades(originalGrades);
        });
    } catch (e) {
        setGrades(originalGrades);
        console.error("Verification error:", e);
        throw e;
    }
  }, [grades, currentUser?.id]);

  const publishResults = useCallback(async (courseId: string, semester: 'SM1' | 'SM2', academicYear: string) => {
    try {
        const { evaluateSemesterOutcome } = await import('../src/utils/academicLogic');
        const targetStudents = studentData.filter(s => s.courseId === courseId);
        
        const updateBatch: Promise<void>[] = [];
        
        for (const student of targetStudents) {
            const studentGrades = grades.filter(g => 
                g.studentId === student.id && 
                g.semester === semester && 
                g.academicYear === academicYear &&
                g.status === 'recommended_by_hod'
            );
            
            if (studentGrades.length > 0) {
                // Mark grades as published/finalized
                studentGrades.forEach(g => {
                    const prevValue = { ...g };
                    const newValue = { 
                        ...g,
                        status: 'finalized',
                        publishedAt: new Date().toISOString(),
                        isLocked: true
                    };
                    updateBatch.push(updateDoc(doc(db, 'grades', g.id), { 
                        status: 'finalized',
                        publishedAt: new Date().toISOString(),
                        isLocked: true
                    }));
                    logAction({
                        targetId: g.id,
                        targetType: 'Grade',
                        action: 'PUBLISH',
                        performedBy: currentUser?.id || 'System',
                        previousValue: prevValue,
                        newValue
                    });
                });

                // Evaluate outcome
                const { outcome, gpa, failedModules } = evaluateSemesterOutcome(studentGrades);
                const resId = `${student.id}_${semester}_${academicYear.replace('/', '-')}`;
                const semesterResult: SemesterResult = {
                    id: resId,
                    studentId: student.id,
                    semester,
                    academicYear,
                    gpa,
                    outcome,
                    failedModules,
                    isPublished: true
                };
                updateBatch.push(setDoc(doc(db, 'semester_results', resId), semesterResult));
            }
        }
        await Promise.all(updateBatch);
        toast.success("Final grades released successfully!");
    } catch (e) {
        console.error("Publishing error:", e);
        throw e;
    }
  }, [studentData, grades, currentUser?.id]);

  const updateStudentReportingStatus = useCallback(async (studentId: string, status: string, reason?: string) => {
    try {
      setActionLoadingId(studentId);
      const studentRef = doc(db, 'users', studentId);
      await updateDoc(studentRef, {
        reportingStatus: status,
        rejectionReason: reason || null,
        reportedAt: status === 'Reported' ? new Date().toISOString() : null
      });
      toast.success(`Student status updated to ${status}`);
    } catch (error) {
      console.error("Error updating student status:", error);
      toast.error("Failed to update student status");
    } finally {
      setActionLoadingId(null);
    }
  }, []);

  const value = useMemo(() => ({
    user: currentUser,
    users: allUsers,
    students: studentData,
    lecturers: lecturerData,
    courses: courseData,
    departments: departmentData,
    announcements: filteredAnnouncements,
    moduleNotices,
    hostels: hostelData,
    classTeachers,
    applications,
    auditLogs,
    role: currentUser?.role || null,
    staffConfirmationCode,
    login,
    signup,
    logout,
    handleTerminateAccount,
    purgeUnfamiliarUser,
    resetAllRegistrations,
    updateStaffCode,
    registrationData,
    isRegistrationLoading,
    submitRegistrationPhase1,
    markRegistrationPaid,
    submitRegistrationPhase2,
    submitRegistrationPhase1Clearance,
    submitRegistrationPhase2Clearance,
    submitFinalRegistrationClearance,
    allocateRoom,
    view,
    setView,
    updateStudent,
    updateUser,
    addStudent,
    bulkAddStudents,
    addLecturer,
    addAnnouncement,
    deleteAnnouncement,
    addModuleNotice,
    addCourse,
    appointClassTeacher,
    submitApplication,
    updateApplicationStatus,
    promoteToHOD,
    updateRegistrationStep,
    updateStudentReportingStatus,
    actionLoadingId,
    submitGrade,
    verifyGrades,
    publishResults,
    grades,
    semesterResults
  }), [currentUser, allUsers, studentData, lecturerData, courseData, departmentData, announcementData, moduleNotices, hostelData, classTeachers, applications, auditLogs, staffConfirmationCode, view, updateStudent, updateUser, addStudent, bulkAddStudents, addLecturer, addAnnouncement, deleteAnnouncement, addModuleNotice, addCourse, appointClassTeacher, submitApplication, updateApplicationStatus, promoteToHOD, updateRegistrationStep, updateStudentReportingStatus, actionLoadingId, resetAllRegistrations, purgeUnfamiliarUser, submitGrade, verifyGrades, publishResults, grades, semesterResults, handleTerminateAccount, allocateRoom]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
