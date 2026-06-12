import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const exportGradesToExcel = (grades: any[], students: any[], fileName: string) => {
    const exportData = grades.map(g => {
        const student = students.find(s => s.id === g.studentId);
        return {
            'Registration Number': student?.admissionNumber || student?.id || g.studentId,
            'Level': g.level || student?.level || 'N/A',
            'Module': g.moduleId,
            'CA Score': g.caScore,
            'SE Score': g.seScore,
            'Total Score': g.totalScore,
            'Grade': g.grade,
            'Points': g.points,
            'Status': g.status,
            'Academic Year': g.academicYear,
            'Semester': g.semester
        };
    });

    exportToExcel(exportData, fileName);
};
