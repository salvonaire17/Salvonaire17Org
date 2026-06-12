
import { useDrag } from '@use-gesture/react';
import { useMotionValue, useSpring } from 'motion/react';
import { useEffect, useState } from 'react';

export const useSwipeSidebar = (onOpen: () => void, onClose: () => void, isOpen: boolean) => {
    const [isDragging, setIsDragging] = useState(false);
    const dragX = useMotionValue(0);
    const springX = useSpring(dragX, { damping: 30, stiffness: 300 });

    const bind = useDrag(({ active, movement: [mx], direction: [xDir], first, last, cancel }) => {
        // Only allow dragging when menu is already open
        if (!isOpen && first) {
            cancel();
            return;
        }

        if (first) setIsDragging(true);
        if (last) {
            setIsDragging(false);
            
            // Logic for snapping (only closure is allowed)
            if (isOpen && (mx < -50 || xDir < -0.5)) {
                onClose();
            }
            dragX.set(0);
            return;
        }

        if (active && isOpen && mx < 0) {
            // Visualize drag progress for closing only
            dragX.set(Math.max(mx, -280));
        }
    }, {
        axis: 'x',
        filterTaps: true,
        bounds: { left: -280, right: 280 },
    });

    return { bind, isDragging, dragX: springX };
};
