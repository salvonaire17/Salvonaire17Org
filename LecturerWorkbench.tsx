import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { Announcement, Role } from "../types";
import { Bookmark, Trash2 } from "lucide-react";

const AnnouncementItem: React.FC<{
  announcement: Announcement;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onDelete?: () => void;
}> = ({ announcement, isBookmarked, onToggleBookmark, onDelete }) => {
  const { courses, user } = useAuth();

  // Determine target strings
  const isAllCourses =
    !announcement.targetCourses || announcement.targetCourses.length === 0;
  const isAllYears =
    !announcement.targetYears || announcement.targetYears.length === 0;

  let targetText = "Target: All Students";
  if (!isAllCourses || !isAllYears) {
    let courseNames = isAllCourses
      ? "All Courses"
      : courses
          .filter((c) => announcement.targetCourses?.includes(c.id))
          .map((c) => c.title)
          .join(", ");
    let yearNames = isAllYears
      ? "All Levels"
      : announcement.targetYears?.map((y) => `Year ${y}`).join(", ");
    targetText = `Target: ${courseNames} | ${yearNames}`;
    if (targetText.length > 50) {
      targetText = targetText.substring(0, 47) + "...";
    }
  }

  const isStaffOnly = announcement.targetRoles?.includes('Lecturer') && !announcement.targetRoles?.includes('Student');

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-5 md:p-8 mb-4 md:mb-6 hover:shadow-sm hover:-translate-y-1 transition-all duration-300 group flex flex-col">
      <div className="flex flex-row items-start justify-between mb-3 md:mb-5 gap-3">
        <div className="flex flex-row items-start gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-xl ${isStaffOnly ? 'bg-cyan-50 text-cyan-700' : 'bg-cyan-50 text-cyan-600'} flex items-center justify-center shadow-inner flex-shrink-0`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-0.5">
              <span className={`text-[9px] font-black uppercase tracking-[0.05em] px-2 py-0.5 rounded-md border flex-shrink-0 ${announcement.priority === 'urgent' ? 'bg-rose-50 border-rose-100 text-rose-600' : (isStaffOnly ? 'bg-cyan-50 text-cyan-700 border-cyan-100' : 'bg-cyan-50 text-cyan-600 border-cyan-100')}`}>
                {announcement.priority === 'urgent' ? 'Important Notice' : (isStaffOnly ? 'Staff Memo' : 'Official Notice')}
              </span>
              <span className="text-[10px] font-black text-slate-400 border-l border-slate-200 pl-3">
                {new Date(announcement.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <h4 className="text-[16px] leading-[1.3] md:text-xl font-black text-slate-900 tracking-tight group-hover:text-cyan-700 transition-colors">
              {announcement.title}
            </h4>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-2 py-1 rounded">
                By {announcement.author}{" "}
                {announcement.authorRole && (
                  <span className="text-cyan-700 font-black">
                    [{announcement.authorRole}]
                  </span>
                )}
              </span>
              {isStaffOnly ? (
                  <span className="text-[9px] font-bold text-cyan-700 bg-cyan-50 px-2 py-1 rounded-md uppercase tracking-widest border border-cyan-100">
                    Staff Only Notice
                  </span>
              ) : (!isAllCourses || !isAllYears ? (
                  <span
                    className="text-[9px] font-bold text-cyan-700 bg-cyan-50 px-2 py-1 rounded-md uppercase tracking-widest truncate max-w-[150px] border border-cyan-100"
                    title={targetText}
                  >
                    {targetText}
                  </span>
              ) : null)}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {onDelete && (user?.id === announcement.authorId || user?.role === 'Admin' || user?.role === 'Principal') && (
            <button
              onClick={onDelete}
              className="p-1.5 md:p-2 rounded-full flex-shrink-0 transition-all duration-300 bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600"
              title="Delete announcement"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button
            onClick={onToggleBookmark}
            className={`p-1.5 md:p-2 rounded-full flex-shrink-0 transition-all duration-300 ${isBookmarked ? "bg-cyan-50 text-cyan-700" : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"}`}
          >
            <Bookmark size={18} className={isBookmarked ? "fill-current" : ""} />
          </button>
        </div>
      </div>

      <div className="prose prose-sm md:prose-base max-w-none prose-slate pl-0 md:pl-12 mt-1 md:mt-0">
        <p className="text-slate-500 leading-relaxed font-medium whitespace-pre-wrap">
          {announcement.content}
        </p>
      </div>
    </div>
  );
};

const AddAnnouncementModal: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const { user, addAnnouncement, courses, users } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetCourses, setTargetCourses] = useState<string[]>([]);
  const [targetYears, setTargetYears] = useState<number[]>([]);
  const [targetAudience, setTargetAudience] = useState<'all' | 'students' | 'lecturers'>('all');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');

  // Suggestion logic
  const handleAISuggestion = () => {
    const lowerContent = content.toLowerCase();
    if (
      lowerContent.includes("ward") ||
      lowerContent.includes("nurs") ||
      lowerContent.includes("midwi")
    ) {
      const nursing = courses.find((c) =>
        c.title.toLowerCase().includes("nursing"),
      );
      if (nursing && !targetCourses.includes(nursing.id)) {
        setTargetCourses([...targetCourses, nursing.id]);
      }
    }
    if (
      lowerContent.includes("clinical") ||
      lowerContent.includes("medicine")
    ) {
      const clinical = courses.find((c) =>
        c.title.toLowerCase().includes("clinical"),
      );
      if (clinical && !targetCourses.includes(clinical.id)) {
        setTargetCourses([...targetCourses, clinical.id]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !user) return;

    const finalTargetRoles: Role[] | undefined = targetAudience === 'all' ? undefined : (targetAudience === 'students' ? ['Student'] : ['Lecturer', 'HOD', 'Principal']);
    const finalTargetCourses = targetAudience === 'lecturers' ? [] : (targetCourses.length > 0 ? targetCourses : undefined);
    const finalTargetYears = targetAudience === 'lecturers' ? [] : (targetYears.length > 0 ? targetYears : undefined);

    const confirmed = window.confirm(`Publish this announcement?\n\nIf you have linked your Google account, it will also be emailed to targeted users.`);
    if (!confirmed) return;

    try {
        const { sendAnnouncementsEmails } = await import('../services/gmail');
        
        const targetEmails = users.filter(u => {
            if (!u.email) return false;
            // Exact match for roles if requested
            if (finalTargetRoles && !finalTargetRoles.includes(u.role)) return false;
            
            // Further filter by course if they are students
            if (u.role === 'Student' && finalTargetCourses) {
                if (!u.courseId || !finalTargetCourses.includes(u.courseId)) return false;
            }
            return true;
        }).map(u => u.email);

        if (targetEmails.length > 0) {
             const emailMsg = `Hello,\n\nA new announcement has been posted by ${user.name} [${user.role}]:\n\nTitle: ${title}\nContent:\n${content}\n\nPriority: ${priority.toUpperCase()}\n\n---\nLogin to the MCHAS Portal to view details.`;
             await sendAnnouncementsEmails(`[MCHAS Notice] ${title}`, emailMsg, targetEmails);
        }

        addAnnouncement({
          title,
          content,
          date: new Date().toISOString(),
          author: user.name,
          authorId: user.id,
          authorRole: user.role,
          priority,
          targetCourses: finalTargetCourses,
          targetYears: finalTargetYears,
          targetRoles: finalTargetRoles,
        });
        onClose();
    } catch (err: any) {
        console.error("Failure adding announcement", err);
        alert(err.message || 'Error sending announcement email');
    }
  };

  const allYears = [1, 2, 3];
  const yearLabels: Record<number, string> = {
    1: "Level 4 (Year I)",
    2: "Level 5 (Year II)",
    3: "Level 6 (Year III)",
  };

  const toggleCourse = (id: string) => {
    setTargetCourses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const toggleYear = (year: number) => {
    setTargetYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year],
    );
  };

  const selectAllCourses = () => {
    if (targetCourses.length === courses.length) {
      setTargetCourses([]);
    } else {
      setTargetCourses(courses.map((c) => c.id));
    }
  };

  const selectAllYears = () => {
    if (targetYears.length === allYears.length) {
      setTargetYears([]);
    } else {
      setTargetYears([...allYears]);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-sm w-full max-w-3xl transform transition-all max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-8 pb-6 border-b border-slate-100 flex-shrink-0">
          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-slate-900 tracking-tight">
            New Announcement
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Notice Title
              </label>
              <input
                type="text"
                placeholder="e.g., Examination Schedule Update"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="p-4 border-2 border-slate-100 rounded-2xl w-full focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 font-bold text-slate-950 bg-slate-50 focus:bg-white placeholder-slate-300 transition-all"
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                  Detailed Content
                </label>
                {content.length > 20 && (
                  <button
                    type="button"
                    onClick={handleAISuggestion}
                    className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-3 py-1.5 rounded-lg flex items-center hover:bg-cyan-100 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z"
                        clipRule="evenodd"
                      />
                    </svg>
                    AI Suggest Target
                  </button>
                )}
              </div>
              <textarea
                placeholder="Type the message for the students and faculty..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="p-4 border-2 border-slate-100 rounded-2xl w-full h-32 resize-none focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 font-medium text-slate-700 bg-slate-50 focus:bg-white placeholder-slate-300 leading-relaxed transition-all"
                required
              />
            </div>

            {/* Targeting Options */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-6">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">
                Announcement Settings
              </h4>

              {/* Target Audience Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Target Audience
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className={`flex-1 min-w-[140px] flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${targetAudience === 'all' ? "border-cyan-500 bg-cyan-50/50" : "border-slate-200 bg-white hover:border-cyan-200"}`}>
                    <input type="radio" className="hidden" checked={targetAudience === 'all'} onChange={() => setTargetAudience('all')} />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${targetAudience === 'all' ? "border-cyan-500" : "border-slate-300"}`}>
                      {targetAudience === 'all' && <div className="w-2 h-2 rounded-full bg-cyan-500" />}
                    </div>
                    <span className={`text-sm font-bold ${targetAudience === 'all' ? "text-cyan-900" : "text-slate-600"}`}>All Users</span>
                  </label>
                  <label className={`flex-1 min-w-[140px] flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${targetAudience === 'students' ? "border-cyan-500 bg-cyan-50/50" : "border-slate-200 bg-white hover:border-cyan-200"}`}>
                    <input type="radio" className="hidden" checked={targetAudience === 'students'} onChange={() => setTargetAudience('students')} />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${targetAudience === 'students' ? "border-cyan-500" : "border-slate-300"}`}>
                      {targetAudience === 'students' && <div className="w-2 h-2 rounded-full bg-cyan-500" />}
                    </div>
                    <span className={`text-sm font-bold ${targetAudience === 'students' ? "text-cyan-900" : "text-slate-600"}`}>Students Only</span>
                  </label>
                  <label className={`flex-1 min-w-[140px] flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${targetAudience === 'lecturers' ? "border-indigo-500 bg-cyan-50/50" : "border-slate-200 bg-white hover:border-indigo-200"}`}>
                    <input type="radio" className="hidden" checked={targetAudience === 'lecturers'} onChange={() => setTargetAudience('lecturers')} />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${targetAudience === 'lecturers' ? "border-indigo-500" : "border-slate-300"}`}>
                      {targetAudience === 'lecturers' && <div className="w-2 h-2 rounded-full bg-cyan-600" />}
                    </div>
                    <span className={`text-sm font-bold ${targetAudience === 'lecturers' ? "text-indigo-900" : "text-slate-600"}`}>Lecturers Only</span>
                  </label>
                </div>
              </div>

              {/* Priority Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Priority Status
                </label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${priority === 'normal' ? "border-cyan-500 bg-cyan-50/50" : "border-slate-200 bg-white hover:border-cyan-200"}`}>
                    <input
                      type="radio"
                      className="hidden"
                      checked={priority === 'normal'}
                      onChange={() => setPriority('normal')}
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${priority === 'normal' ? "border-cyan-500" : "border-slate-300"}`}>
                      {priority === 'normal' && <div className="w-2 h-2 rounded-full bg-cyan-500" />}
                    </div>
                    <span className={`text-sm font-bold ${priority === 'normal' ? "text-cyan-900" : "text-slate-600"}`}>
                      Standard Notice
                    </span>
                  </label>
                  <label className={`flex-1 flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${priority === 'urgent' ? "border-rose-500 bg-rose-50/50" : "border-slate-200 bg-white hover:border-rose-200"}`}>
                    <input
                      type="radio"
                      className="hidden"
                      checked={priority === 'urgent'}
                      onChange={() => setPriority('urgent')}
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${priority === 'urgent' ? "border-rose-500" : "border-slate-300"}`}>
                      {priority === 'urgent' && <div className="w-2 h-2 rounded-full bg-rose-500" />}
                    </div>
                    <span className={`text-sm font-bold ${priority === 'urgent' ? "text-rose-900" : "text-slate-600"}`}>
                      Highly Important
                    </span>
                  </label>
                </div>
              </div>

              {/* Courses Selection */}
              {targetAudience !== 'lecturers' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Select Courses
                    </label>
                    <button
                      type="button"
                      onClick={selectAllCourses}
                      className="text-[10px] font-bold text-cyan-600 hover:text-cyan-700 uppercase"
                    >
                      {targetCourses.length === courses.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {courses.map((course) => (
                      <label
                        key={course.id}
                        className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${targetCourses.includes(course.id) ? "border-cyan-500 bg-cyan-50/50" : "border-slate-200 bg-white hover:border-cyan-200"}`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={targetCourses.includes(course.id)}
                          onChange={() => toggleCourse(course.id)}
                        />
                        <div
                          className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center mr-3 transition-colors ${targetCourses.includes(course.id) ? "border-cyan-500 bg-cyan-500" : "border-slate-300"}`}
                        >
                          {targetCourses.includes(course.id) && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="3"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <span
                          className={`text-sm font-bold ${targetCourses.includes(course.id) ? "text-cyan-900" : "text-slate-600"}`}
                        >
                          {course.title}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Years Selection */}
              {targetAudience !== 'lecturers' && (
                <div>
                  <div className="flex items-center justify-between mb-3 mt-6">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Select Study Year (NTA Level)
                    </label>
                    <button
                      type="button"
                      onClick={selectAllYears}
                      className="text-[10px] font-bold text-cyan-600 hover:text-cyan-700 uppercase"
                    >
                      {targetYears.length === allYears.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {allYears.map((year) => (
                      <label
                        key={year}
                        className={`flex items-center px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${targetYears.includes(year) ? "border-cyan-500 bg-cyan-50/50" : "border-slate-200 bg-white hover:border-cyan-200"}`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={targetYears.includes(year)}
                          onChange={() => toggleYear(year)}
                        />
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center mr-2 transition-colors ${targetYears.includes(year) ? "border-cyan-500 bg-cyan-500" : "border-slate-300"}`}
                        >
                          {targetYears.includes(year) && (
                            <svg
                              className="w-2.5 h-2.5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="3"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <span
                          className={`text-sm font-bold ${targetYears.includes(year) ? "text-cyan-900" : "text-slate-600"}`}
                        >
                          {yearLabels[year]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[10px] font-bold text-slate-400 mt-4 leading-relaxed">
                Note: {targetAudience === 'lecturers' ? "This announcement will be visible ONLY to STAFF/LECTURERS." : (targetAudience === 'students' ? "This announcement will be visible ONLY to specified STUDENTS." : "Visible to ALL registered users.")}
              </p>
            </div>
          </div>
        </form>
        <div className="p-8 pt-6 border-t border-slate-100 flex justify-end space-x-4 flex-shrink-0 bg-slate-50/50 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="bg-white border-2 border-slate-200 text-slate-600 font-bold py-3 px-6 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-cyan-600 text-white font-bold py-3 px-8 rounded-2xl hover:bg-cyan-700 shadow-sm shadow-cyan-600/20 transition-all hover:-translate-y-0.5 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
            Publish Notice
          </button>
        </div>
      </div>
    </div>
  );
};

export const AnnouncementsView: React.FC = () => {
  const { user, announcements, deleteAnnouncement } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`bookmarks_${user?.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev => {
      const isBookmarked = prev.includes(id);
      const next = isBookmarked ? prev.filter(b => b !== id) : [...prev, id];
      localStorage.setItem(`bookmarks_${user?.id}`, JSON.stringify(next));
      return next;
    });
  };

  const sortedAnnouncements = [...announcements].sort((a, b) => {
    const aBookmarked = bookmarkedIds.includes(a.id);
    const bBookmarked = bookmarkedIds.includes(b.id);
    
    // 1. Bookmarked first
    if (aBookmarked && !bBookmarked) return -1;
    if (!aBookmarked && bBookmarked) return 1;

    // 2. Urgent priority next
    const aUrgent = a.priority === 'urgent';
    const bUrgent = b.priority === 'urgent';
    if (aUrgent && !bUrgent) return -1;
    if (!aUrgent && bUrgent) return 1;

    // 3. Newest first (they are usually sorted from backend, but explicit sorting ensures stable UI)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Typecast user to access title since LecturerDetails doesn't have it by default or it's weakly typed
  const canPost =
    user?.role === "Admin" ||
    user?.role === "Principal" ||
    user?.role === "Secretary" ||
    user?.role === "HOD" ||
    user?.role === "Admission Officer" ||
    (user as any)?.title === "Minister";

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-slate-900 tracking-tight">
            Announcements
          </h3>
        </div>
        {canPost && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-cyan-600 text-white font-bold py-3 px-6 rounded-2xl shadow-sm shadow-cyan-100 hover:bg-cyan-700 transition-all hover:-translate-y-0.5 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Post Notice
          </button>
        )}
      </div>

      <div className="space-y-2">
        {sortedAnnouncements.map((announcement) => (
          <AnnouncementItem 
            key={announcement.id} 
            announcement={announcement} 
            isBookmarked={bookmarkedIds.includes(announcement.id)}
            onToggleBookmark={() => toggleBookmark(announcement.id)}
            onDelete={async () => {
              if (window.confirm("Are you sure you want to delete this announcement?")) {
                await deleteAnnouncement(announcement.id);
              }
            }}
          />
        ))}
      </div>

      {announcements.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 2v4a2 2 0 002 2h4"
              />
            </svg>
          </div>
          <p className="text-lg font-bold text-slate-400">
            No announcements posted yet.
          </p>
        </div>
      )}

      {isModalOpen && (
        <AddAnnouncementModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};
