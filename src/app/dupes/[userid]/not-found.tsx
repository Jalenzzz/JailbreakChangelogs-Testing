import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-primary-text mb-4 text-4xl font-bold">User Not Found</h1>
        <p className="text-secondary-text mb-8">
          The user you&apos;re looking for doesn&apos;t exist or has no dupe data available.
        </p>
        <Link
          href="/dupes"
          className="bg-button-info text-form-button-text hover:bg-button-info-hover inline-flex items-center gap-2 rounded-lg px-4 py-2 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Dupe Finder
        </Link>
      </div>
    </div>
  );
}
