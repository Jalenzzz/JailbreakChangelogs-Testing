'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from './IconWrapper';
import { flushSync } from 'react-dom';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { safeLocalStorage } from '@/utils/safeStorage';

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<'div'> {
  duration?: number;
}

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  ...props
}: AnimatedThemeTogglerProps) => {
  const { theme, setTheme } = useTheme();
  const [isDark, setIsDark] = useState(theme === 'dark');
  const buttonRef = useRef<HTMLDivElement>(null);

  // Sync with theme context
  useEffect(() => {
    setIsDark(theme === 'dark');
  }, [theme]);

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return;

    const newTheme = isDark ? 'light' : 'dark';

    if ('startViewTransition' in document) {
      await document.startViewTransition(() => {
        flushSync(() => {
          // Direct DOM manipulation for immediate effect
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(newTheme);
          safeLocalStorage.setItem('theme', newTheme);

          // Update React state
          setIsDark(!isDark);
          setTheme(newTheme);
        });
      }).ready;

      const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
      const x = left + width / 2;
      const y = top + height / 2;
      const maxRadius = Math.hypot(
        Math.max(left, window.innerWidth - left),
        Math.max(top, window.innerHeight - top),
      );

      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`],
        },
        {
          duration,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    } else {
      // Fallback for browsers without View Transitions API
      setTheme(newTheme);
    }
  }, [isDark, setTheme, duration]);

  return (
    <div
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(
        'cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95',
        className,
      )}
      {...props}
    >
      {isDark ? (
        <Icon icon="solar:sun-bold-duotone" className="text-primary-text h-5 w-5" inline={true} />
      ) : (
        <Icon icon="line-md:moon-filled" className="text-primary-text h-5 w-5" inline={true} />
      )}
      <span className="sr-only">Toggle theme</span>
    </div>
  );
};
