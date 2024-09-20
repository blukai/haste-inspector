import type React from "react";
import { useLayoutEffect, useState } from "react";

const INITIAL_STATE = Object.freeze({ width: 0, height: 0 });

export function useElementSize(ref: React.RefObject<HTMLElement | SVGElement>) {
  const [size, setSize] = useState<{
    width: number;
    height: number;
  }>(INITIAL_STATE);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const handleResize = () => {
      if (el instanceof SVGElement) {
        // NOTE: svg elements don't have offset(Width|Height)
        const rect = el.getBoundingClientRect();
        setSize({ width: rect.width, height: rect.height });
      } else if (el instanceof HTMLElement) {
        // NOTE: in some cases (for example on match > lanes page)
        // initial bounding client rect gives wrong size :shrug:
        setSize({ width: el.offsetWidth, height: el.offsetHeight });
      }
    };

    handleResize();

    const ro = new ResizeObserver(handleResize);
    ro.observe(el);

    return () => {
      ro.unobserve(el);
    };
  }, [ref]);

  return size;
}
