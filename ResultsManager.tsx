import React from 'react';
import { useDataContext } from '../hooks/useDataContext';
import type { StudentDetails } from '../types';

const StudentRow: React.FC<{ student: StudentDetails; courseTitle: string }> = ({ student, courseTitle }) => (
    <tr className="hover:bg-slate-50 border-b border-slate-200">
        <td className="p-4 whitespace-nowrap text-sm font-medium text-slate-900">{student.name}</td>
        <td className="p-4 whitespace-nowrap text-sm text-slate-500">{student.id}</td>
        <td className="p-4 whitespace-nowrap text-sm text-slate-500">{student.email}</td>
        <td className="p-4 whitespace-nowrap text-sm text-slate-500">{courseTitle}</td>
        <td className="p-4 whitespace-nowrap text-sm text-slate-500">{student.level}</td>
        <td className="p-4 whitespace-nowrap text-right text-sm font-medium">
             <a href="#" className="text-cyan-700 hover:text-indigo-900">Edit</a>
        </td>
    </tr>
);

export const Students: React.FC = () => {
    const { students, courses } = useDataContext();

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-800">All Students</h3>
                <p className="text-sm text-slate-500 mt-1">A comprehensive list of all students currently enrolled.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-widest">Name</th>
                            <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-widest">Student ID</th>
                            <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-widest">Email</th>
                            <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-widest">Course</th>
                            <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-widest">Level</th>
                            <th scope="col" className="relative p-4"><span className="sr-only">Edit</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {students.map(student => {
                            const course = courses.find(c => c.id === student.courseId);
                            return (
                                <StudentRow key={student.id} student={student} courseTitle={course?.title || 'N/A'}/>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
