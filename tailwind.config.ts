import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        '3xl': '1920px',
      },
      aspectRatio: {
        card: '1 / 1',
      },
      colors: {
        'primary-bg': 'var(--color-primary-bg)',
        'secondary-bg': 'var(--color-secondary-bg)',
        'newsletter-bg': 'var(--color-newsletter-bg)',
        'primary-text': 'var(--color-primary-text)',
        'secondary-text': 'var(--color-secondary-text)',
        'card-headline': 'var(--color-card-headline)',
        'card-paragraph': 'var(--color-card-paragraph)',
        'card-tag-bg': 'var(--color-card-tag-bg)',
        'card-tag-text': 'var(--color-card-tag-text)',
        'card-highlight': 'var(--color-card-highlight)',
        link: 'var(--color-link)',
        'link-hover': 'var(--color-link-hover)',
        'button-info': 'var(--color-button-info)',
        'button-info-hover': 'var(--color-button-info-hover)',
        'button-success': 'var(--color-button-success)',
        'button-danger': 'var(--color-button-danger)',
        'form-button': 'var(--color-form-button)',
        'form-button-text': 'var(--color-form-button-text)',
        'form-input': 'var(--color-form-input)',
        'form-label': 'var(--color-form-label)',
        highlight: 'var(--color-highlight)',
        secondary: 'var(--color-secondary)',
        tertiary: 'var(--color-tertiary)',
        stroke: 'var(--color-stroke)',
      },
    },
  },
  plugins: [],
};

export default config;
