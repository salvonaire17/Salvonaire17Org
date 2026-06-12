
import React, { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileUp, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Database, 
  Table as TableIcon,
  X,
  FileSpreadsheet,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { doc, setDoc, writeBatch, collection, arrayUnion } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import type { StudentResult, BatchResult } from '../types';

interface ResultRow {
  StudentID: string;
  StudentName: string;
  Score: number;
  Subject?: string;
}

import PremiumDropdown from './PremiumDropdown';

const ResultsManager: React.FC = () => {
  const { user, courses, students } = useAuth() as any;
  const [isParsing, setIsParsing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [metadata, setMetadata] = useState({
    courseId: '',
    level: '',
    semester: '',
    academicYear: '',
    subject: ''
  });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateGrade = (score: number) => {
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const setMetadataField = (name: string, value: string) => {
    const newMetadata = { ...metadata, [name]: value };
    setMetadata(newMetadata);
    
    // Auto-populate preview data if both course and level are set
    if ((name === 'courseId' || name === 'level') && newMetadata.courseId && newMetadata.level) {
        const enrolled = students.filter((s: any) => 
            s.courseId === newMetadata.courseId && 
            s.level === newMetadata.level && 
            (s.registrationStatus === 'Registered' || s.workflowState?.globalStatus === 'Fully Registered') && 
            s.role === 'Student'
        );
        
        const freshPreview = enrolled.map((student: any) => ({
            studentId: student.id,
            registrationNumber: student.registrationWorkflow?.indexNumber || student.nactvetRegNo || student.indexNumber || 'N/A',
            studentName: student.name,
            score: '',
            grade: '-',
            subject: newMetadata.subject || '',
            courseId: newMetadata.courseId,
            level: newMetadata.level,
            semester: newMetadata.semester
        }));
        
        setPreviewData(freshPreview);
        if(freshPreview.length > 0) {
            toast.success(`Loaded ${freshPreview.length} students for manual entry.`);
        } else {
            toast.error(`No registered students found for this course and level.`);
        }
    }
  };

  const overrideScore = (index: number, newScore: number | string) => {
      const updated = [...previewData];
      const parsed = Number(newScore);
      updated[index] = {
          ...updated[index],
          score: newScore,
          grade: isNaN(parsed) || newScore === '' ? '-' : calculateGrade(parsed)
      };
      setPreviewData(updated);
  };

  const processFile = async (file: File) => {
    if (!file) return;
    setIsParsing(true);
    setPreviewData([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json<ResultRow>(worksheet);

      if (json.length === 0) {
        throw new Error("The file appears to be empty.");
      }

      // Basic structure validation
      const firstRow = json[0];
      if (!firstRow.StudentID || !firstRow.Score) {
        throw new Error("Invalid file format. Required headers: StudentID, Score.");
      }

      const formattedResults: any[] = json.map(row => {
        // Try to match student by Name or ID
        const matched = students.find((s:any) => 
            (s.registrationWorkflow?.indexNumber === row.StudentID || s.nactvetRegNo === row.StudentID || s.indexNumber === row.StudentID) ||
            s.id === row.StudentID
        );

        return {
            studentId: matched ? matched.id : String(row.StudentID).trim(),
            registrationNumber: String(row.StudentID).trim(),
            studentName: row.StudentName || matched?.name || 'Unknown Student',
            score: Number(row.Score),
            grade: calculateGrade(Number(row.Score)),
            subject: metadata.subject || row.Subject || '',
            courseId: metadata.courseId,
            level: metadata.level,
            semester: metadata.semester
        };
      });

      setPreviewData(formattedResults);
      toast.success(`Successfully parsed ${formattedResults.length} records.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to process file");
      console.error(err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const publishResults = async () => {
    if (!metadata.courseId || !metadata.level || !metadata.semester || !metadata.academicYear) {
      toast.error("Missing metadata configuration.");
      return;
    }

    if (previewData.length === 0) {
      toast.error("No results to publish.");
      return;
    }
    
    // Only publish rows with actual scores
    const validData = previewData.filter(d => d.score !== '' && d.score !== null);
    
    if (validData.length === 0) {
        toast.error("Please enter scores for students before publishing.");
        return;
    }

    setIsPublishing(true);
    const batchId = `${metadata.courseId}_${metadata.level.replace(/\s/g, '')}_${metadata.academicYear.replace(/\//g, '-')}_${metadata.semester}`;
    const batch = writeBatch(db);

    try {
      // 1. Create the Master Batch Document
      const batchRef = doc(db, 'results', batchId);
      const batchPayload: BatchResult = {
        id: batchId,
        courseId: metadata.courseId,
        level: metadata.level,
        academicYear: metadata.academicYear,
        semester: metadata.semester,
        uploadedBy: user?.id || 'Unknown',
        uploadedAt: new Date().toISOString(),
        status: 'Published'
      };
      batch.set(batchRef, batchPayload);

      // 2. Individual Sub-collection writes & User Profile Updates
      validData.forEach((res: any) => {
        // Official Result Record
        const payload = {
            studentId: res.studentId,
            courseId: res.courseId,
            level: res.level,
            semester: res.semester,
            score: Number(res.score),
            subject: res.subject || metadata.subject,
            grade: res.grade
        };

        const studentResRef = doc(collection(batchRef, 'studentGrades'), res.studentId);
        batch.set(studentResRef, payload);

        // Update User Profile for fast Dashboard access
        const userRef = doc(db, 'users', res.studentId);
        batch.update(userRef, {
          grades: arrayUnion({
            courseId: metadata.courseId,
            score: Number(res.score),
            semester: metadata.semester,
            subject: res.subject || metadata.subject
          })
        });
      });

      await batch.commit();
      toast.success(`Published ${validData.length} records successfully!`);
      setPreviewData([]); // Clear after success
    } catch (err: any) {
      toast.error("Cloud Database Write Failed: " + err.message);
      console.error(err);
    } finally {
      setIsPublishing(false);
    }
  };

  const isMetadataComplete = metadata.courseId && metadata.level && metadata.semester && metadata.academicYear && metadata.subject;

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8 bg-slate-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span className="p-2 bg-cyan-600 text-white rounded-xl shadow-sm shadow-indigo-100">
              <FileSpreadsheet size={24} />
            </span>
            Academic Results Engine
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2">Upload, process, and publish student module grades securely.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="hidden sm:flex flex-col items-end">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Role</p>
              <p className="text-xs font-bold text-cyan-700">{user?.role} Access</p>
           </div>
           <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-cyan-700">
              <Database size={20} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Metadata & Upload Control */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm shadow-slate-200/50 border border-slate-100 relative z-20">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Database size={120} className="text-cyan-700" />
             </div>
             
             <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                Metadata Context
                <Info size={16} className="text-slate-300" />
             </h2>

             <div className="space-y-5">
                <div className="space-y-2">
                  <PremiumDropdown 
                    label="Select Course"
                    placeholder="Choose Course..."
                    options={courses.map(c => ({ id: c.id, label: c.title }))}
                    selectedId={metadata.courseId}
                    onSelect={(id) => setMetadataField('courseId', id)}
                  />
                </div>

                <div className="space-y-2">
                   <PremiumDropdown 
                    label="Select Level"
                    placeholder="NTA Level..."
                    options={[
                        { id: 'NTA 4', label: 'NTA 4' },
                        { id: 'NTA 5', label: 'NTA 5' },
                        { id: 'NTA 6', label: 'NTA 6' }
                    ]}
                    selectedId={metadata.level}
                    onSelect={(id) => setMetadataField('level', id)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <PremiumDropdown 
                      label="Semester"
                      placeholder="Select..."
                      options={[
                        { id: 'SM1', label: 'Semester 1' },
                        { id: 'SM2', label: 'Semester 2' }
                      ]}
                      selectedId={metadata.semester}
                      onSelect={(id) => setMetadataField('semester', id)}
                    />
                  </div>
                  <div className="space-y-2">
                    <PremiumDropdown 
                      label="Year"
                      placeholder="Select..."
                      options={[
                        { id: '2023/24', label: '2023/24' },
                        { id: '2024/25', label: '2024/25' }
                      ]}
                      selectedId={metadata.academicYear}
                      onSelect={(id) => setMetadataField('academicYear', id)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Subject Name</label>
                  <input 
                    type="text"
                    name="subject"
                    value={metadata.subject}
                    onChange={(e) => setMetadata(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g. Fundamental Anatomy"
                    className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-700 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                  />
                </div>

                <div className="pt-4">
                  {!isMetadataComplete ? (
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                       <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                       <p className="text-[10px] font-bold text-amber-700 uppercase leading-relaxed tracking-widest">
                         Metadata Required: You must choose a Course, Semester, and Academic Year before uploading.
                       </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
                       <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                       <p className="text-[10px] font-bold text-emerald-700 uppercase leading-relaxed tracking-widest">
                         System Ready: Drag and drop your spreadsheet to begin parsing.
                       </p>
                    </div>
                  )}
                </div>
             </div>
          </div>

          <AnimatePresence>
            {isMetadataComplete && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group relative h-64 bg-white border-4 border-dashed rounded-[2.5rem] transition-all duration-300 flex flex-col items-center justify-center p-8 text-center cursor-pointer overflow-hidden
                  ${dragActive ? 'border-indigo-500 bg-cyan-50/50 scale-102 shadow-sm shadow-indigo-100' : 'border-slate-100 hover:border-indigo-300 hover:bg-slate-50'}
                  ${isParsing ? 'pointer-events-none opacity-60' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".xlsx,.xls,.csv" 
                />
                
                {isParsing ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-cyan-700" size={48} />
                    <p className="text-sm font-black text-cyan-700 uppercase tracking-widest pulse">Processing File...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-indigo-100 text-cyan-700 rounded-2xl flex items-center justify-center mb-4 ring-8 ring-indigo-50 transition-all group-hover:scale-110 group-hover:bg-cyan-600 group-hover:text-white">
                      <FileUp size={32} />
                    </div>
                    <span className="text-sm font-black text-slate-900 mb-1">Click or Drop Spreadsheet</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Excel, CSV format supported</span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Preview & Action */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] shadow-sm shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col h-[700px]">
             <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white relative z-10">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-slate-950 text-white rounded-lg">
                      <TableIcon size={18} />
                   </div>
                   <h3 className="text-lg font-black text-slate-900 tracking-tight">Data Preview Tool</h3>
                </div>

                {previewData.length > 0 && (
                  <button 
                    onClick={() => setPreviewData([])}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
             </div>

             <div className="flex-1 overflow-auto relative">
                {previewData.length > 0 ? (
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-md z-10">
                        <tr>
                          <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Reg. Number</th>
                          <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Name</th>
                          <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Score</th>
                          <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Grade</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {previewData.map((row: any, idx) => (
                         <motion.tr 
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(idx * 0.02, 1) }}
                          className="hover:bg-cyan-50/30 transition-colors group"
                         >
                            <td className="px-6 py-4 text-xs font-mono font-bold text-cyan-700">{row.registrationNumber || row.studentId}</td>
                            <td className="px-6 py-4 text-xs font-bold text-slate-700">{row.studentName}</td>
                            <td className="px-6 py-4 text-center">
                               <input 
                                 type="number" 
                                 placeholder="-"
                                 value={row.score === '' ? '' : row.score}
                                 onChange={(e) => overrideScore(idx, e.target.value)}
                                 className="inline-block w-16 py-1.5 px-2 bg-slate-50 hover:bg-white focus:bg-white border text-center border-slate-200 focus:border-indigo-500 rounded-lg text-xs font-black text-slate-900 outline-none transition-all"
                               />
                            </td>
                            <td className="px-6 py-4 text-center">
                               <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black
                                 ${row.grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                                   row.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                                   row.grade === 'F' ? 'bg-rose-100 text-rose-700' : 
                                   row.grade === '-' ? 'bg-slate-100 text-slate-400' : 'bg-amber-100 text-amber-700'}`}>
                                 {row.grade}
                               </span>
                            </td>
                         </motion.tr>
                       ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-40">
                     <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                        <TableIcon size={40} className="text-slate-300" />
                     </div>
                     <h4 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-slate-400 uppercase tracking-widest">No Data Parsed</h4>
                     <p className="text-sm font-bold text-slate-400 mt-2">Select metadata and upload a file to view a preview here.</p>
                  </div>
                )}
             </div>

             <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex flex-col">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Records</p>
                   <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-slate-900">{previewData.length}</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={previewData.length === 0 || isPublishing}
                  onClick={publishResults}
                  className="px-10 py-4 bg-slate-900 text-white font-black text-[12px] uppercase tracking-[0.2em] rounded-2xl shadow-sm shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isPublishing ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      Publish to Cloud <ChevronRight size={18} />
                    </>
                  )}
                </motion.button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsManager;
