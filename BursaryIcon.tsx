import React from 'react';
import { Icon } from './Icon';

export const LeadershipIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 1.75l-2.43 5L4 7.25l4.5 4.125L7.31 17 12 14.125 16.69 17l-1.19-5.625L20 7.25l-5.57-.5L12 1.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 22.25h16.5" />
    </Icon>
);