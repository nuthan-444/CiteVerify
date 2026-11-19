import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Drop-in page-entrance animation hook.
 * Usage: const ref = usePageEntrance();  → place ref on the page root div.
 *
 * All direct children with [data-animate] get staggered fade-up.
 * The root itself gets a quick fade-in.
 */
export function usePageEntrance(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      // Root container fades in instantly
      gsap.from(ref.current!, {
        opacity: 0,
        duration: 0.3,
        delay,
        ease: 'power2.out',
      });

      // Direct [data-animate] children stagger up
      const targets = ref.current!.querySelectorAll('[data-animate]');
      if (targets.length > 0) {
        gsap.from(targets, {
          y: 32,
          opacity: 0,
          duration: 0.55,
          stagger: 0.09,
          delay: delay + 0.05,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        });
      }
    }, ref);

    return () => ctx.revert();
  }, [delay]);

  return ref;
}

/**
 * Animate a list of items as they mount.
 * Usage: const ref = useStaggerIn(); → place ref on the list container.
 */
export function useStaggerIn(stagger = 0.08, delay = 0) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      const children = ref.current!.children;
      if (children.length === 0) return;

      gsap.from(children, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger,
        delay,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });
    }, ref);

    return () => ctx.revert();
  }, [stagger, delay]);

  return ref;
}
