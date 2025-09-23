'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Tooltip = dynamic(() => import('@mui/material/Tooltip'));

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const themes = [
    { value: 'light' as const, label: 'Light', icon: SunIcon },
    { value: 'dark' as const, label: 'Dark', icon: MoonIcon },
    { value: 'system' as const, label: 'System', icon: ComputerDesktopIcon },
  ] as const;

  const currentTheme = themes.find((t) => t.value === theme);
  const CurrentIcon = currentTheme?.icon || MoonIcon;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cycleTheme = () => {
    const currentIndex = themes.findIndex((t) => t.value === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].value);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Compact toggle button */}
      <Tooltip
        title={`Current: ${currentTheme?.label}. Click to cycle themes`}
        arrow
        placement="bottom"
        slotProps={{
          tooltip: {
            sx: {
              backgroundColor: 'var(--color-secondary-bg)',
              color: 'var(--color-primary-text)',
              '& .MuiTooltip-arrow': {
                color: 'var(--color-secondary-bg)',
              },
            },
          },
        }}
      >
        <button
          onClick={cycleTheme}
          className="border-border-primary bg-secondary-bg text-secondary-text hover:text-primary-text hover:bg-quaternary-bg flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <CurrentIcon className="h-5 w-5" />
        </button>
      </Tooltip>

      {/* Dropdown for desktop users who want more control */}
      <div className="hidden lg:block">
        <Tooltip
          title="Theme options"
          arrow
          placement="bottom"
          slotProps={{
            tooltip: {
              sx: {
                backgroundColor: 'var(--color-secondary-bg)',
                color: 'var(--color-primary-text)',
                '& .MuiTooltip-arrow': {
                  color: 'var(--color-secondary-bg)',
                },
              },
            },
          }}
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="border-border-primary bg-secondary-bg text-secondary-text hover:text-primary-text hover:bg-quaternary-bg ml-1 flex h-10 w-8 cursor-pointer items-center justify-center rounded-lg border transition-all duration-200"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </Tooltip>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="bg-secondary-bg border-border-primary absolute top-full right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border shadow-lg">
            <div className="py-1">
              {themes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    setTheme(value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-sm transition-colors ${
                    theme === value
                      ? 'bg-button-info text-form-button-text'
                      : 'text-secondary-text hover:text-primary-text hover:bg-quaternary-bg'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                  {theme === value && (
                    <svg className="ml-auto h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
