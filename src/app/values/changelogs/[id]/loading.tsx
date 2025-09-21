import { Skeleton } from '@mui/material';

export default function Loading() {
  return (
    <main className="mb-8 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="space-y-6">
          {/* Header Skeleton with Side-by-Side Layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Changelog Info Skeleton - Takes up 2/3 of the space */}
            <div className="border-stroke bg-secondary-bg rounded-lg border p-6 lg:col-span-2">
              <Skeleton variant="text" width="60%" height={40} className="bg-secondary-bg" />
              <Skeleton variant="text" width="40%" height={24} className="bg-secondary-bg mt-2" />
              <div className="mt-4">
                <Skeleton variant="text" width="20%" height={20} className="bg-secondary-bg" />
                <div className="mt-2 flex flex-wrap gap-2">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton
                      key={i}
                      variant="text"
                      width={Math.random() * 60 + 40}
                      height={16}
                      className="bg-secondary-bg"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Ad Skeleton - Takes up 1/3 of the space */}
            <div className="lg:col-span-1">
              <div
                className="bg-secondary-bg h-full rounded-lg border"
                style={{ minHeight: '250px' }}
              >
                <div className="p-4">
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height="100%"
                    className="bg-secondary-bg rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters Skeleton */}
          <div className="border-stroke rounded-lg border p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Skeleton
                variant="rectangular"
                width="100%"
                height={56}
                className="rounded bg-[#37424D]"
              />
              <Skeleton
                variant="rectangular"
                width={150}
                height={56}
                className="rounded bg-[#37424D]"
              />
            </div>
          </div>

          {/* Changes Grid Skeleton */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border-stroke rounded-lg border p-4">
                <div className="mb-4 flex items-center gap-3">
                  <Skeleton
                    variant="rectangular"
                    width={64}
                    height={64}
                    className="bg-secondary-bg rounded-lg"
                  />
                  <div className="flex-1">
                    <Skeleton variant="text" width="80%" height={24} className="bg-secondary-bg" />
                    <Skeleton
                      variant="text"
                      width="60%"
                      height={20}
                      className="bg-secondary-bg mt-1"
                    />
                  </div>
                </div>
                <div className="mb-4 space-y-2">
                  <Skeleton variant="text" width="70%" height={20} className="bg-secondary-bg" />
                  <Skeleton variant="text" width="90%" height={20} className="bg-secondary-bg" />
                </div>
                <div className="border-stroke flex items-center justify-between border-t pt-4">
                  <Skeleton variant="circular" width={24} height={24} className="bg-secondary-bg" />
                  <Skeleton variant="text" width="30%" height={16} className="bg-secondary-bg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
