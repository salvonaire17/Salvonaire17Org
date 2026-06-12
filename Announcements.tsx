
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDataContext } from '../hooks/useDataContext';
import { StudentsIcon } from './icons/StudentsIcon';
import { CoursesIcon } from './icons/CoursesIcon';
import { AnnouncementsIcon } from './icons/AnnouncementsIcon';
import type { Announcement } from '../types';

const StatCard: React.FC<{ title: string; value: string | number; children: React.ReactNode; }> = ({ title, value, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4 transition-transform hover:scale-105 duration-300">
        <div className="bg-indigo-100 text-cyan-700 p-3 rounded-full">
            {children}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-slate-800">{value}</p>
        </div>
    </div>
);

const AnnouncementCard: React.FC<{ announcement: Announcement }> = ({ announcement }) => (
    <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-sm transition-shadow duration-300">
        <h4 className="font-bold text-slate-800">{announcement.title}</h4>
        <p className="text-sm text-slate-600 mt-1">{announcement.content}</p>
        <p className="text-xs text-slate-400 mt-3 text-right">{new Date(announcement.date).toLocaleDateString()}</p>
    </div>
);

export const Dashboard: React.FC = () => {
    const { students, courses, announcements, enrollmentStats } = useDataContext();

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Students" value={students.length}>
                    <StudentsIcon className="h-6 w-6"/>
                </StatCard>
                <StatCard title="Available Courses" value={courses.length}>
                    <CoursesIcon className="h-6 w-6"/>
                </StatCard>
                <StatCard title="Recent Announcements" value={announcements.length}>
                    <AnnouncementsIcon className="h-6 w-6"/>
                </StatCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Enrollment by Department</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={enrollmentStats} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                <XAxis dataKey="department" tick={{ fill: '#475569', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
                                <Tooltip wrapperClassName="rounded-md shadow-sm border-none" contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}/>
                                <Legend />
                                <Bar dataKey="students" fill="#4f46e5" name="Students" barSize={30} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Latest Announcements</h3>
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                        {announcements.slice(0, 3).map(ann => (
                            <AnnouncementCard key={ann.id} announcement={ann} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
