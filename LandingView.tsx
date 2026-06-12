import { Grade, AcademicOutcome } from '../../types';

export const calculateGrade = (total: number) => {
    if (total >= 75) return { grade: 'A' as const, points: 5 };
    if (total >= 70) return { grade: 'B+' as const, points: 4 };
    if (total >= 60) return { grade: 'B' as const, points: 3 };
    if (total >= 50) return { grade: 'C' as const, points: 2 };
    if (total >= 45) return { grade: 'D' as const, points: 1 };
    return { grade: 'F' as const, points: 0 };
};

export const evaluateSemesterOutcome = (grades: Grade[]): { outcome: AcademicOutcome, gpa: number, failedModules: string[] } => {
    if (grades.length === 0) return { outcome: 'PENDING', gpa: 0, failedModules: [] };

    const totalPoints = grades.reduce((acc, curr) => acc + curr.points, 0);
    const gpa = Number((totalPoints / grades.length).toFixed(1));
    
    // Fail defined as < 50 (D and F are failures in many NACTVET health contexts requiring Supp)
    const failedGrades = grades.filter(g => g.totalScore < 50);
    const failedModules = failedGrades.map(g => g.moduleId);

    let outcome: AcademicOutcome = 'PASS';

    if (failedModules.length > 0 && failedModules.length <= 2) {
        outcome = 'SUPPLEMENTARY';
    } else if (failedModules.length > 2) {
        outcome = 'DISCONTINUE';
    }

    // Special logic for Repeat could be added if Supp attempts are tracked
    
    return { outcome, gpa, failedModules };
};
