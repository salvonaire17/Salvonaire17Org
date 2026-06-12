import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useDataContext = () => {
    const authContext = useAuth();
    if (!authContext) {
        throw new Error("useDataContext must be used within an AuthProvider");
    }

    const { students, departments } = authContext;

    const enrollmentStats = useMemo(() => {
        if (!students || !departments) return [];
        const stats: { [key: string]: number } = {};
        
        departments.forEach(dept => {
            stats[dept.name] = 0;
        });

        students.forEach(student => {
            const dept = departments.find(d => d.id === student.departmentId);
            if (dept) {
                if (!stats[dept.name]) {
                    stats[dept.name] = 0;
                }
                stats[dept.name]++;
            }
        });
        
        return Object.entries(stats).map(([department, studentCount]) => ({
            department,
            students: studentCount,
        }));

    }, [students, departments]);

    return { ...authContext, enrollmentStats };
};
