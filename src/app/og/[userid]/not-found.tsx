import Link from 'next/link';
import Breadcrumb from '@/components/Layout/Breadcrumb';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb />
      <div className="py-12 text-center">
        <h1 className="text-primary-text mb-4 text-3xl font-bold">User Not Found</h1>
        <p className="text-secondary-text mb-6">
          The Roblox user ID you&apos;re looking for doesn&apos;t exist or is invalid.
        </p>
        <Link
          href="/og"
          className="bg-button-info text-form-button-text hover:bg-button-info-hover inline-flex items-center rounded-lg px-4 py-2 transition-colors"
        >
          Back to OG Finder
        </Link>
      </div>
    </div>
  );
}
