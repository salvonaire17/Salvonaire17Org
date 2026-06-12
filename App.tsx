
import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { PrincipalDashboard } from './views/PrincipalDashboard';
import { StudentDashboard } from './views/StudentDashboard';
import { Dashboard } from './views/Dashboard';
import { ProfileView } from './views/ProfileView';
import { CoursesView } from './views/CoursesView';
import { AnnouncementsView } from './views/AnnouncementsView';
import { WardenView } from './views/WardenView';
import { BursaryView } from './views/BursaryView';
import { AiAssistant } from './components/AiAssistant';
import { LecturersView } from './views/LecturersView';
import { AdmissionsView } from './views/AdmissionsView';
import { LeadershipView } from './views/LeadershipView';
import { CompleteProfileView } from './views/CompleteProfileView';
import { RegistrationView } from './views/RegistrationView';
import { SessionWatcherView } from './views/SessionWatcherView';
import { RegisteredView } from './views/RegisteredView';
import { LecturerWorkbench } from './views/LecturerWorkbench';
import { AcademicOfficerDashboard } from './views/AcademicOfficerDashboard';
import { AdminStaffDashboard } from './views/AdminStaffDashboard';
import { ParentDashboard } from './views/ParentDashboard';
import { ComplaintsView } from './views/ComplaintsView';
import { LandingView } from './views/LandingView';
import { AboutView } from './views/AboutView';
import { SettingsView } from './views/SettingsView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { useSwipeSidebar } from './hooks/useSwipeSidebar';


export default function App() {
  const { user, view, registrationData, isRegistrationLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { bind, dragX } = useSwipeSidebar(
    () => setIsSidebarOpen(true),
    () => setIsSidebarOpen(false),
    isSidebarOpen
  );

  if (!user) {
    if (view === 'landing') return <LandingView />;
    return <LoginScreen />;
  }

  const renderView = () => {
    // REGISTRATION GUARD FOR STUDENTS
    if (user?.role === 'Student') {
        const isAdmissionApproved = registrationData?.phase1?.admission?.status === 'APPROVED';
        const isBursarConfirmed = registrationData?.phase1?.bursar?.status === 'CONFIRMED';
        const isNhifConfirmed = registrationData?.phase1?.nhif?.status === 'CONFIRMED';
        const isSuppliesApproved = registrationData?.phase1?.supplies?.status === 'APPROVED';
        
        const phase1FullyApproved = isAdmissionApproved && isBursarConfirmed && isNhifConfirmed && isSuppliesApproved;
        
        const isHodApproved = registrationData?.phase2?.hod?.status === 'APPROVED' || registrationData?.phase2?.hod?.status === 'Recommended by HOD; Pending Vice Principal Confirmation';
        const isWardenApproved = registrationData?.phase2?.warden?.status === 'APPROVED';
        const isVicePrincipalApproved = registrationData?.phase2?.vicePrincipal?.status === 'APPROVED';
        
        const isFullyRegistered = phase1FullyApproved && isHodApproved && isWardenApproved && isVicePrincipalApproved;

        // If loading registration info, show skeleton
        if (isRegistrationLoading) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <div className="w-16 h-16 border-4 border-cyan-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Authenticating Workflow...</p>
                </div>
            );
        }

        // LOCKING LOGIC
        if (!isFullyRegistered && view !== 'profile' && view !== 'courses') {
            if (!isAdmissionApproved) {
                return <RegistrationView forcedStep="ADMISSION" />;
            }
            if (!isBursarConfirmed || !isNhifConfirmed) {
                return <RegistrationView forcedStep="BURSAR" />;
            }
            if (phase1FullyApproved && !isHodApproved) {
                return <RegistrationView forcedStep="PHASE2" />;
            }
            // Fallback for intermediate states
            return <RegistrationView />;
        }
    }

    switch (view) {
      case 'dashboard':
        if (user.role === 'Principal') return <PrincipalDashboard />;
        if (user.role === 'Student') return <StudentDashboard />;
        if (user.role === 'Lecturer' || user.role === 'HOD') return <LecturerWorkbench />;
        if (user.role === 'Academic Officer') return <AcademicOfficerDashboard />;
        if (user.role === 'Parent') return <ParentDashboard />;
        
        const adminRoles = [
            'Admission Officer', 'Admission', 'Bursar', 'NHIF', 'NHIF Officer',
            'Supplies Officer', 'Warden', 'Secretary', 'Vice Principal', 'Admin', 'System Administrator'
        ];
        if (adminRoles.includes(user.role)) return <AdminStaffDashboard />;
        
        return <Dashboard />;
      case 'profile':
        return <ProfileView />;
      case 'courses':
        return <CoursesView />;
      case 'lecturers':
        return <LecturersView />;
      case 'announcements':
        return <AnnouncementsView />;
      case 'hostels':
          return <WardenView />;
      case 'bursary':
          return <BursaryView />;
      case 'admissions':
        return <AdmissionsView />;
      case 'leadership':
        return <LeadershipView />;
      case 'complete-profile':
        return <CompleteProfileView />;
      case 'registration':
        return <RegistrationView />;
      case 'session-watcher':
        return <SessionWatcherView />;
      case 'registered':
        return <RegisteredView />;
      case 'complaints':
        return <ComplaintsView />;
      case 'about':
        return <AboutView />;
      case 'settings':
        return <SettingsView />;
      case 'notifications':
        return <div className="p-10 text-center"><h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Notifications</h2><p className="text-slate-500">Your campus notifications will appear here.</p></div>;
      default:
        return <Dashboard />;
    }
  };

  const viewTitle: Record<string, string> = {
      dashboard: 'Dashboard',
      profile: 'My Profile',
      courses: 'Course Catalog',
      lecturers: 'Facilitators Directory',
      announcements: 'Announcements',
      hostels: 'Hostel Management',
      bursary: 'Bursary & Payments',
      admissions: 'Admissions Office',
      presence: 'Student Presence',
      leadership: 'Leadership Management',
      'complete-profile': 'Complete Your Profile',
      registration: 'Registration',
      'session-watcher': 'Session Watcher',
      registered: 'Registered Directory',
      about: 'About MCHAS',
      complaints: 'Feedback',
      settings: 'App Settings',
      notifications: 'Alerts'
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-cyan-100 selection:text-cyan-900" {...bind()}>
      <Toaster position="top-right" />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        dragX={dragX}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header 
            title={viewTitle[view] || 'Dashboard'} 
            onMenuClick={() => setIsSidebarOpen(true)} 
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-4 md:p-8 pb-20 md:pb-8">
          <div className="max-w-[1600px] w-full mx-auto min-h-screen flex flex-col justify-between">
            <div className="flex-1">
              {renderView()}
            </div>
            <footer className="w-full py-4 mt-auto flex justify-center items-center pointer-events-none select-none">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-300/80">
                © {new Date().getFullYear()} SALVO. All Rights Reserved.
              </span>
            </footer>
          </div>
        </main>
      </div>

      {user.role === 'Student' && <MobileBottomNav />}

      {view !== 'complete-profile' && <AiAssistant />}
    </div>
  );
}
