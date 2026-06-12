import React from 'react';
import { Icon } from './Icon';

export const AdmissionsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h4a2 2 0 012 2v1m-4 0h4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12h.01M12 15h.01M12 18h.01" />
    </Icon>
);