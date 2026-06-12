
import React from 'react';
import { Icon } from './Icon';

export const AnnouncementsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.514C18.332 12.836 20 14.5 20 16.5a4.5 4.5 0 01-4.5 4.5H7" />
    </Icon>
);
