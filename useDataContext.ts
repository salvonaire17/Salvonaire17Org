
import type { User, Department, Course, StudentDetails, LecturerDetails, Hostel, Announcement, Payment } from '../types';

const DEFAULT_PW = 'Mchas@2024';

export const departments: Department[] = [
    { id: 'NURSING AND MIDWIFERY', name: 'NURSING AND MIDWIFERY' },
    { id: 'PHYSIOTHERAPY', name: 'PHYSIOTHERAPY' },
    { id: 'CLINICAL DENTISTRY', name: 'CLINICAL DENTISTRY' },
    { id: 'DIAGNOSTIC RADIOGRAPHY', name: 'DIAGNOSTIC RADIOGRAPHY' },
    { id: 'PHARMACEUTICAL SCIENCE', name: 'PHARMACEUTICAL SCIENCE' },
    { id: 'MEDICAL LABORATORY', name: 'MEDICAL LABORATORY' },
    { id: 'CLINICAL MEDICINE', name: 'CLINICAL MEDICINE' },
];

export const courses: Course[] = [
    { 
        id: 'C01', 
        code: 'CM101', 
        title: 'CLINICAL MEDICINE', 
        departmentId: 'CLINICAL MEDICINE', 
        credits: 5, 
        description: 'A robust clinical program focusing on diagnostic reasoning, patient management, and primary healthcare delivery in various clinical settings.' 
    },
    { 
        id: 'C02', 
        code: 'NM101', 
        title: 'NURSING AND MIDWIFERY', 
        departmentId: 'NURSING AND MIDWIFERY', 
        credits: 4, 
        description: 'Professional training combining advanced nursing care with specialized midwifery skills to ensure safe maternal and neonatal health outcomes.' 
    },
    { 
        id: 'C03', 
        code: 'PS101', 
        title: 'PHARMACEUTICAL SCIENCE', 
        departmentId: 'PHARMACEUTICAL SCIENCE', 
        credits: 4, 
        description: 'Exploration of drug discovery, pharmacology, and pharmacy practice to prepare experts in medication management and safety.' 
    },
    { 
        id: 'C04', 
        code: 'ML101', 
        title: 'MEDICAL LABORATORY', 
        departmentId: 'MEDICAL LABORATORY', 
        credits: 4, 
        description: 'Technical expertise in pathology, microbiology, and biochemistry for accurate disease diagnosis and clinical research.' 
    },
    { 
        id: 'C05', 
        code: 'DR101', 
        title: 'DIAGNOSTIC RADIOGRAPHY', 
        departmentId: 'DIAGNOSTIC RADIOGRAPHY', 
        credits: 4, 
        description: 'Specialized training in medical imaging technologies including X-ray, CT, and Ultrasound for diagnostic and interventional purposes.' 
    },
    { 
        id: 'C06', 
        code: 'PT101', 
        title: 'PHYSIOTHERAPY', 
        departmentId: 'PHYSIOTHERAPY', 
        credits: 4, 
        description: 'Focus on physical rehabilitation, movement science, and therapeutic exercises to improve patient mobility and quality of life.' 
    },
    { 
        id: 'C07', 
        code: 'CD101', 
        title: 'CLINICAL DENTISTRY', 
        departmentId: 'CLINICAL DENTISTRY', 
        credits: 5, 
        description: 'Comprehensive study of oral health, dental surgery, and preventive dentistry to produce competent dental health professionals.' 
    },
];

export const lecturers: LecturerDetails[] = [
    { id: 'T01', name: 'Prof. Stephen Mshana', email: 'principal@mchas.udsm.ac.tz', password: DEFAULT_PW, role: 'Principal', avatar: 'https://i.pravatar.cc/150?u=principal', departmentId: 'CLINICAL MEDICINE', modules: [], phone: '+255 25 250 0001', title: 'College Principal' },
];

export const users: User[] = [
    { id: 'ADM01', name: 'Mr. Julius Kambarage', email: 'admissions@mchas.udsm.ac.tz', password: DEFAULT_PW, role: 'Admission Officer', avatar: 'https://i.pravatar.cc/150?u=adm01', phone: '+255 25 250 0004' },
    { id: 'BUR01', name: 'Ms. Sarah Mbeya', email: 'bursar@mchas.udsm.ac.tz', password: DEFAULT_PW, role: 'Bursar', avatar: 'https://i.pravatar.cc/150?u=bur01', phone: '+255 25 250 0005' },
    { id: 'WAR01', name: 'Mr. John Wick', email: 'warden@mchas.udsm.ac.tz', password: DEFAULT_PW, role: 'Warden', avatar: 'https://i.pravatar.cc/150?u=war01', phone: '+255 25 250 0006' },
    { id: 'SEC01', name: 'Mrs. Fatuma Ali', email: 'secretary@mchas.udsm.ac.tz', password: DEFAULT_PW, role: 'Secretary', avatar: 'https://i.pravatar.cc/150?u=sec01', phone: '+255 25 250 0007', departmentId: 'CLINICAL MEDICINE' },
    { id: 'ACA01', name: 'Dr. Lucas Malima', email: 'academic@mchas.udsm.ac.tz', password: DEFAULT_PW, role: 'Academic Officer', avatar: 'https://i.pravatar.cc/150?u=aca01', phone: '+255 25 250 0010' },
];

export const students: StudentDetails[] = [];

export const payments: Payment[] = [];

export const hostels: Hostel[] = [
    {
        id: 'H01', name: 'MCHAS Main Hostel', capacity: 200,
        rooms: [
            { id: 'R101', number: 'Block A-01', capacity: 2, occupants: [] },
            { id: 'R102', number: 'Block A-02', capacity: 2, occupants: [] },
        ]
    }
];

export const announcements: Announcement[] = [
  { id: 'A001', title: 'Welcome to MCHAS UDSM', content: 'We welcome all first-year students to the Mbeya College of Health and Allied Sciences. Orientation week starts on Monday.', date: '2024-01-20T14:00:00Z', author: 'Prof. Stephen Mshana', authorId: 'T01' },
];

export const allUsersForLogin = [...lecturers, ...users, ...students];

