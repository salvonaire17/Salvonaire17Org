
import React from 'react';
import { useDataContext } from '../hooks/useDataContext';
import type { Announcement } from '../types';

const AnnouncementItem: React.FC<{ announcement: Announcement }> = ({ announcement }) => (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-6 md:p-8 mb-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-50 rounded-bl-full opacity-40 pointer-events-none z-0" />
        <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start md:gap-4 mb-4 space-y-3 md:space-y-0">
                <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {announcement.author} {announcement.authorRole ? `| ${announcement.authorRole}` : ''}
                    </p>
                    <h4 className="mt-1 text-xl md:text-2xl font-black text-slate-900 tracking-tight">{announcement.title}</h4>
                </div>
                <div className="self-start">
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-700 whitespace-nowrap bg-cyan-50 px-3 py-1.5 rounded-xl">
                        {new Date(announcement.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>
            </div>
            <p className="text-slate-600 mt-4 leading-relaxed">{announcement.content}</p>
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button className="text-[10px] font-black uppercase tracking-widest text-cyan-700 bg-cyan-50 hover:bg-cyan-100 px-4 py-2 rounded-xl transition-all active:scale-95 duration-200">More Info</button>
            </div>
        </div>
    </div>
);

export const Announcements: React.FC = () => {
    const { announcements } = useDataContext();

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-slate-800">Campus Announcements</h3>
                    <p className="text-sm text-slate-500 mt-1">Latest news and updates for students and faculty.</p>
                </div>
                {/* Future: <button>+ New Announcement</button> */}
            </div>
            <div>
                {announcements.map(announcement => (
                    <AnnouncementItem key={announcement.id} announcement={announcement} />
                ))}
            </div>
        </div>
    );
};
