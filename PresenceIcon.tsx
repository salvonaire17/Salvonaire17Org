
import React from 'react';
import { Icon } from './Icon';

export const AttendanceIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 13.5L12 11l2.5 2.5" />
    </Icon>
);
