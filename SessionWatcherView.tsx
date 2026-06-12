import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { StaffWorkflowLayout } from '../components/StaffWorkflowLayout';
import type { StudentDetails } from '../types';
import toast from 'react-hot-toast';

export const BursaryView: React.FC = () => {
    const { user, students, courses, updateUser } = useAuth();

    if (!user || (!['Bursar', 'Principal', 'Vice Principal', 'Admin'].includes(user.role))) {
        return (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-12 text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-slate-800 uppercase tracking-tight">Access Restricted</h3>
                <p className="text-slate-500 mt-4 font-medium leading-relaxed">This terminal is restricted to authorized financial personnel. Please contact system administration if you believe this is an error.</p>
            </div>
        );
    }

    const handleProcessPayment = (student: StudentDetails) => {
        // In a real application, you might open a modal for amount entry or control number verification
        const confirmed = window.confirm(`Confirm payment clearance for ${student.name}?`);
        if (confirmed) {
            updateUser(student.id, { 
                reportingStatus: 'Reported',
                paymentStatus: 'Paid' 
            });
            toast.success(`Payment successfully cleared for ${student.name.split(' ')[0]}`);
        }
    };

    const handleViewDetails = (student: StudentDetails) => {
        toast.success(`Opening transaction history for ${student.name}`);
        // Logic for opening detailed student ledger would go here
    };

    return (
        <StaffWorkflowLayout
            title="Finance & Fees Terminal"
            officeRole="Bursar's Office"
            students={students}
            courses={courses}
            waitingFilter={(s) => s.paymentStatus !== 'Paid'}
            solvedFilter={(s) => s.paymentStatus === 'Paid'}
            onProcessStudent={handleProcessPayment}
            onViewDetails={handleViewDetails}
        />
    );
};
