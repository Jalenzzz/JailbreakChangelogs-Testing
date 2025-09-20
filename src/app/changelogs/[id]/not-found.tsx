import Link from 'next/link';
import { HomeIcon } from '@heroicons/react/24/outline';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export default function ChangelogNotFound() {
  return (
    <div className="bg-primary-bg text-secondary-text relative flex min-h-screen items-center justify-center bg-[url('https://assets.jailbreakchangelogs.xyz/assets/backgrounds/background16.webp')] bg-cover bg-center bg-no-repeat">
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 z-[1] bg-black/50" />
      {/* Vignette overlay */}
      <div className="absolute inset-0 z-[1] bg-[url('https://assets.jailbreakchangelogs.xyz/assets/backgrounds/vignette.png')] bg-cover bg-center bg-no-repeat" />

      <div className="relative z-[2] mx-auto max-w-md px-4 text-center">
        <div className="rounded-2xl border border-white/[0.12] bg-[rgba(30,30,30,0.35)] px-8 py-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <div className="mb-8">
            <div className={`${inter.className} text-button-info text-9xl font-bold`}>404</div>
            <h1 className="text-primary-text mb-2 text-2xl font-bold">Changelog Not Found</h1>
            <p className="text-secondary-text">
              The changelog you&apos;re looking for doesn&apos;t exist or may have been removed.
            </p>
          </div>
          <div className="space-y-3">
            <Link
              href="/changelogs"
              className="bg-button-info text-form-button-text hover:bg-button-info-hover flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors"
            >
              Browse All Changelogs
            </Link>
            <Link
              href="/"
              className="text-primary-text bg-primary-bg flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3"
            >
              <HomeIcon className="h-5 w-5" />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
