'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type TransitionPhase = 'idle' | 'loading' | 'transitioning';

export function useImageTransition(length: number, durationMs: number) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [incomingIndex, setIncomingIndex] = useState<number | null>(null);
    const [phase, setPhase] = useState<TransitionPhase>('idle');
    const activeRef = useRef(0);
    const incomingRef = useRef<number | null>(null);
    const queuedRef = useRef<number | null>(null);
    const phaseRef = useRef<TransitionPhase>('idle');
    const frameRef = useRef<number | null>(null);

    const updatePhase = useCallback((nextPhase: TransitionPhase) => {
        phaseRef.current = nextPhase;
        setPhase(nextPhase);
    }, []);

    const finish = useCallback(() => {
        const completed = incomingRef.current;
        if (completed === null) return;
        activeRef.current = completed;
        incomingRef.current = null;
        setActiveIndex(completed);
        setIncomingIndex(null);
        updatePhase('idle');
    }, [updatePhase]);

    const select = useCallback(
        (requestedIndex: number) => {
            if (length < 2) return;
            const nextIndex = ((requestedIndex % length) + length) % length;
            if (nextIndex === incomingRef.current || (incomingRef.current === null && nextIndex === activeRef.current)) return;

            if (incomingRef.current !== null) {
                if (phaseRef.current === 'loading') {
                    incomingRef.current = nextIndex;
                    setIncomingIndex(nextIndex);
                } else {
                    queuedRef.current = nextIndex;
                }
                return;
            }

            incomingRef.current = nextIndex;
            setIncomingIndex(nextIndex);
            updatePhase('loading');
        },
        [length, updatePhase],
    );

    const ready = useCallback(
        (index: number) => {
            if (incomingRef.current !== index || phaseRef.current !== 'loading') return;
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                finish();
                return;
            }
            if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
            frameRef.current = window.requestAnimationFrame(() => {
                frameRef.current = window.requestAnimationFrame(() => updatePhase('transitioning'));
            });
        },
        [finish, updatePhase],
    );

    const transitionEnd = useCallback(
        (index: number, propertyName: string) => {
            if (propertyName === 'opacity' && incomingRef.current === index && phaseRef.current === 'transitioning') finish();
        },
        [finish],
    );

    const reset = useCallback(() => {
        activeRef.current = 0;
        incomingRef.current = null;
        queuedRef.current = null;
        setActiveIndex(0);
        setIncomingIndex(null);
        updatePhase('idle');
    }, [updatePhase]);

    useEffect(() => {
        if (phase !== 'idle' || incomingIndex !== null || queuedRef.current === null) return;
        const queued = queuedRef.current;
        queuedRef.current = null;
        if (queued !== activeRef.current) select(queued);
    }, [incomingIndex, phase, select]);

    useEffect(() => {
        if (phase !== 'transitioning') return;
        const fallback = window.setTimeout(finish, durationMs + 180);
        return () => window.clearTimeout(fallback);
    }, [durationMs, finish, phase]);

    useEffect(() => {
        if (length > 0 && activeRef.current >= length) reset();
    }, [length, reset]);

    useEffect(
        () => () => {
            if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
        },
        [],
    );

    return {
        activeIndex,
        incomingIndex,
        phase,
        displayIndex: phase === 'transitioning' && incomingIndex !== null ? incomingIndex : activeIndex,
        targetIndex: incomingIndex ?? activeIndex,
        select,
        ready,
        transitionEnd,
        reset,
    };
}
