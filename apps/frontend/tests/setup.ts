import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MotionComponent = React.forwardRef<any, any>(
  ({ children, className, style, ...props }, ref) => {
    const filtered: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(props)) {
      if (!['aria-', 'role', 'id', 'tabIndex', 'title'].some((p) => key.startsWith(p) || key === p)) continue;
      filtered[key] = val;
    }
    return React.createElement('div', { ref, className, style, ...filtered }, children as React.ReactNode);
  },
);
MotionComponent.displayName = 'motion-component';

vi.mock('framer-motion', () => {
  const motion = new Proxy({}, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get: () => MotionComponent as any,
  });

  return {
    motion,
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children),
    useReducedMotion: () => false,
  };
});
