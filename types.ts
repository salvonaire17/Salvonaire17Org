export type Role =
  | "Principal"
  | "Vice Principal"
  | "Lecturer"
  | "HOD"
  | "Warden"
  | "Bursar"
  | "Admission Officer"
  | "Projects Officer"
  | "Supplies Officer"
  | "Academic Officer"
  | "System Administrator"
  | "Student"
  | "Secretary"
  | "Parent"
  | "Admin"
  | "NHIF"
  | "NHIF Officer";

export type View =
  | "landing"
  | "login"
  | "dashboard"
  | "profile"
  | "courses"
  | "lecturers"
  | "announcements"
  | "attendance"
  | "hostels"
  | "bursary"
  | "admissions"
  | "presence"
  | "leadership"
  | "complete-profile"
  | "timetable"
  | "registration"
  | "management"
  | "workbench"
  | "research"
  | "feedback"
  | "almanac"
  | "dspace"
  | "events"
  | "campuses"
  | "settings"
  | "complaints"
  | "registered"
  | "session-watcher"
  | "notifications"
  | "about";

export interface Complaint {
  id: string;
  text: string;
  category?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  gender?: "Male" | "Female";
  avatar: string;
  departmentId?: string;
  courseId?: string; // For students and HODs (primary lead course)
  phone: string;
  title?: string; // For leadership positions like 'President', 'Minister'
  specialization?: string; // For Faculty focus areas
  isProfileComplete?: boolean;
  linkedStudentId?: string; // For Parent role
  linkedStudentName?: string; // For Parent role linking
  isOnline?: boolean;
  lastActive?: string;
  admissionNumber?: string;
  nactvetRegNo?: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  departmentId: string;
  credits: number;
  description: string;
}

export interface AdmittedStudent {
  id: string;
  indexNumber: string;
  name: string;
  courseId: string;
  batch: string;
  feeControlNumber?: string;
}

export interface FeeStructure {
  id: string;
  courseId: string;
  courseName: string;
  tuitionAmount: number;
  hostelAmount: number;
  description?: string;
  updatedAt: string;
}

export interface RegistrationStage {
    status: 'pending' | 'approved' | 'rejected';
    verifiedBy?: string;
    verifiedAt?: string;
    comments?: string;
}

export interface BursarStage extends RegistrationStage {
    controlNumber?: string;
    amountPaid?: number;
    balance?: number;
}

export interface ProjectsStage extends RegistrationStage {
    assignedMaterials?: string[]; // e.g. ["Rim 1", "Latex 1"]
    paymentDetails?: string;
}

export interface InsuranceStage extends RegistrationStage {
    nhifStatus?: 'Active' | 'Inactive';
    insuranceControlNumber?: string;
    amountPaid?: number;
}

export interface LogisticsStage extends RegistrationStage {
    itemsCollected?: boolean;
    controlNumber?: string;
    studentMarkedPaid?: boolean;
}

export interface FinalClearanceStage extends RegistrationStage {
    hostelAssigned?: string;
    roomAssigned?: string;
    fileOpened?: boolean; // For Secretary
    allocatedAt?: string;
    blockAssigned?: string;
}

export interface RegistrationWorkflow {
    indexNumber?: string;
    status: 
        | "pending_admission"
        | "pending_bursar"
        | "pending_insurance_and_projects"
        | "pending_department_and_supplies"
        | "pending_final_clearance"
        | "fully_registered"
        | "rejected";
    currentStep: number;
    
    // Office Specific Sub-objects
    admission?: RegistrationStage;
    bursar?: BursarStage;
    insurance?: InsuranceStage;
    projects?: ProjectsStage;
    hod?: RegistrationStage;
    supplies?: LogisticsStage;
    warden?: FinalClearanceStage;
    secretary?: RegistrationStage;
    vicePrincipal?: RegistrationStage;

    residence?: "inHostel" | "offCampus" | null;
    uploadedDocuments?: string[];
    isComplete?: boolean;
    lastUpdatedAt?: string;
}

export interface Grade {
    id: string;
    studentId: string;
    courseId: string;
    moduleId: string;
    level: string;
    semester: 'SM1' | 'SM2';
    academicYear: string;
    caScore: number; // Max 40
    seScore: number; // Max 60
    totalScore: number; // Max 100
    grade: 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
    points: number;
    status: 'draft' | 'pending_hod_review' | 'recommended_by_hod' | 'finalized';
    isSupplementary?: boolean;
    submittedBy: string; // Lecturer ID
    submittedAt: string;
    verifiedBy?: string; // HOD or Academic Officer ID
    verifiedAt?: string;
    publishedAt?: string;
    isLocked?: boolean; // Locked after submission to HOD or Academic
}

export interface AuditLog {
    id: string;
    targetId: string; // The ID of the record changed (e.g., Grade ID)
    targetType: 'Grade' | 'User' | 'Course' | 'Settings';
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH' | 'VERIFY';
    performedBy: string; // User ID
    previousValue: any;
    newValue: any;
    timestamp: string;
    ipAddress?: string;
}

export type AcademicOutcome = 'PASS' | 'SUPPLEMENTARY' | 'REPEAT_MODULE' | 'DISCONTINUE' | 'PENDING';

export interface SemesterResult {
    id: string;
    studentId: string;
    semester: 'SM1' | 'SM2';
    academicYear: string;
    gpa: number;
    outcome: AcademicOutcome;
    failedModules: string[];
    isPublished: boolean;
}

export interface StudentDetails extends User {
  role: "Student";
  level: string;
  currentSemester?: "SM1" | "SM2";
  registrationStatus: "Registered" | "Unregistered";
  reportingStatus?: "Pending" | "Reported" | "Rejected";
  reportingDate?: string;
  parentDetails?: {
    parentName: string;
    parentPhone: string;
  };

  registrationWorkflow?: RegistrationWorkflow;
  registrationState?: {
      phase1Submitted: boolean;
      admissionApproved: boolean;
      suppliesApproved: boolean;
      suppliesDetails: string;
      bursarControlNo: string;
      bursarPaidByStudent: boolean;
      bursarConfirmed: boolean;
      nhifControlNo: string;
      nhifPaidByStudent: boolean;
      nhifConfirmed: boolean;
      phase2Submitted: boolean;
      hodApproved: boolean;
      wardenRoom: string;
      wardenApproved: boolean;
      registryApproved: boolean;
      vpApproved: boolean;
      form: {
        name: string;
        regNo: string;
        course: string;
        level: string;
        phone: string;
        housing: string;
        age: number;
        nida: string;
      }
  };
  grades: any[]; // Changed to any to avoid recursion or duplicate issues if Grade is still defining
  paymentStatus: "Paid" | "Pending" | "Overdue" | "Completed";
  balanceDue: number; // For the Financial Guard
  nhifStatus: "Active" | "Inactive" | "Completed";
  heslbStatus: "Loaned" | "Not Loaned" | "Completed";
  hostelStatus: "Allocated" | "Pending" | "Off-Campus" | "Completed";
  hostelId?: string;
  roomId?: string;
  hostelAllocationDate?: string; // ISO string
  attendance: AttendanceRecord[];
}

export interface LecturerDetails extends User {
  role: "Lecturer" | "HOD" | "Principal" | "Vice Principal" | "Secretary" | "Bursar" | "Admission Officer" | "Warden" | "Admin" | "Academic Officer" | "System Administrator" | "Projects Officer" | "Supplies Officer" | "NHIF" | "NHIF Officer";
  modules: string[]; // Course IDs or specific Module names
  classTeacherLevel?: string; // e.g., 'NTA 4'
}

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  status: "Present" | "Absent";
  checkIn?: string; // HH:mm
  checkOut?: string; // HH:mm
}

export interface Payment {
  studentId: string;
  amount: number;
  date: string;
  type: "Tuition" | "Hostel";
  status: "Confirmed" | "Pending";
}

export interface Hostel {
  id: string;
  name: string; // 'Old Hostel', 'New Hostel'
  capacity: number;
  rooms: HostelRoom[];
}

export interface HostelRoom {
  id: string;
  number: string;
  capacity: number;
  occupants: string[]; // studentIds
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string; // ISO string
  author: string; // Name of the author
  authorId: string; // ID of the authoring user
  authorRole?: string; // Role of the author (e.g. Principal, Admin)
  targetCourses?: string[]; // Course IDs. If empty or absent, implies all courses
  targetYears?: number[]; // NTA Levels (e.g. 4, 5, 6). If empty or absent, implies all years/levels
  targetRoles?: Role[]; // Target roles (e.g. ['Teacher', 'Student']). If empty or absent, implies all roles relevant to the context
  priority?: 'normal' | 'urgent'; // Importance of the announcement
}

export interface ModuleNotice {
  id: string;
  moduleId: string; // The specific Course ID
  title: string;
  content: string;
  date: string;
  author: string;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  image?: string; // For AI generated images
  sources?: { uri: string; title: string }[]; // For Google Search grounding
}

export interface AdmissionApplication {
  id: string;
  studentName: string;
  email: string;
  phone: string;
  courseId: string;
  status: "Pending" | "Reviewing" | "Verified" | "Accepted" | "Rejected";
  appliedDate: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface StudentResult {
  studentId: string;
  studentName: string;
  score: number;
  grade: string;
  subject?: string;
  courseId: string; // Restored for flat querying/compatibility
  level: string;
  semester: string; // Restored for flat querying/compatibility
}

export interface BatchResult {
  id: string; // courseId_academicYear_semester
  courseId: string;
  level: string;
  academicYear: string;
  semester: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'Published' | 'Draft';
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  description: string;
  coverImage: string;
  photoCount: number;
  videoCount: number;
  featured?: boolean;
}

export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  type:
    | "Note"
    | "PDF"
    | "Video"
    | "Image"
    | "Announcement"
    | "Lecture"
    | "Assignment";
  category:
    | "Study Materials"
    | "Videos"
    | "Photos"
    | "Sports"
    | "Events"
    | "Announcements"
    | "Campus Life";
  url: string; // External link or storage reference
  thumbnailUrl?: string; // For videos or images
  courseId?: string;
  subject?: string;
  semester?: string;
  eventId?: string; // Relation to event
  uploadedBy: string; // User ID
  uploadedAt: string; // ISO String
  size?: number; // File size in bytes
  views?: number;
  likes?: number;
}

export const ROLE_LIMITS: Record<string, number> = {
    'Principal': 20,
    'Vice Principal': 20,
    'Warden': 20,
    'Bursar': 20,
    'Admission Officer': 20,
    'NHIF Officer': 20,
};
