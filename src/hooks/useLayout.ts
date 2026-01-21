'use client';

import { useCallback } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type LayoutId, type LayoutConfig, layouts, getLayout } from '@/lib/themes';

// ============================================
// Store Zustand pour le layout
// ============================================

interface LayoutState {
    layoutId: LayoutId;
    setLayoutId: (id: LayoutId) => void;
    cycleLayout: () => void;
}

export const useLayoutStore = create<LayoutState>()(
    persist(
        (set, get) => ({
            layoutId: 'default',

            setLayoutId: (layoutId) => set({ layoutId }),

            cycleLayout: () => {
                const layoutIds = Object.keys(layouts) as LayoutId[];
                const currentIndex = layoutIds.indexOf(get().layoutId);
                const nextIndex = (currentIndex + 1) % layoutIds.length;
                set({ layoutId: layoutIds[nextIndex] });
            },
        }),
        {
            name: 'bus-display-layout',
        }
    )
);

// ============================================
// Hook useLayout
// ============================================

interface UseLayoutReturn {
    layout: LayoutConfig;
    layoutId: LayoutId;
    setLayout: (id: LayoutId) => void;
    cycleLayout: () => void;
    applyLayoutCSS: () => void;
}

export function useLayout(): UseLayoutReturn {
    const { layoutId, setLayoutId, cycleLayout } = useLayoutStore();
    const layout = getLayout(layoutId);

    // Applique les variables CSS du layout
    const applyLayoutCSS = useCallback(() => {
        if (typeof document === 'undefined') return;

        const root = document.documentElement;

        // Header
        root.style.setProperty('--layout-header-height', layout.header.height);
        root.style.setProperty('--layout-header-icon-size', layout.header.iconSize);
        root.style.setProperty('--layout-header-title-size', layout.header.titleSize);

        // Departures
        root.style.setProperty('--layout-card-padding', layout.departures.cardPadding);
        root.style.setProperty('--layout-card-margin', layout.departures.cardMargin);
        root.style.setProperty('--layout-card-min-height', layout.departures.cardMinHeight);
        root.style.setProperty('--layout-card-gap', layout.departures.gap);
        root.style.setProperty('--layout-grid-columns', layout.departures.gridColumns);
        root.style.setProperty('--layout-line-number-size', layout.departures.lineNumberSize);
        root.style.setProperty('--layout-font-line-number', layout.departures.fontSize.lineNumber);
        root.style.setProperty('--layout-font-time', layout.departures.fontSize.time);
        root.style.setProperty('--layout-font-destination', layout.departures.fontSize.destination);
        root.style.setProperty('--layout-font-minutes', layout.departures.fontSize.minutesLeft);

        // Footer
        root.style.setProperty('--layout-footer-height', layout.footer.height);
        root.style.setProperty('--layout-clock-size', layout.footer.clockSize);

        // Attribut data pour CSS conditionnel
        document.body.setAttribute('data-layout', layoutId);
    }, [layout, layoutId]);

    return {
        layout,
        layoutId,
        setLayout: setLayoutId,
        cycleLayout,
        applyLayoutCSS,
    };
}

export type { LayoutConfig, LayoutId };
