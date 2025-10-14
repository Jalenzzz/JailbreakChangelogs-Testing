'use client';

export default function ServiceAvailabilityTicker() {
  // Check if service availability ticker should be shown
  const shouldShowTicker = process.env.NEXT_PUBLIC_SHOW_SERVICE_AVAILABILITY_TICKER === 'true';

  if (!shouldShowTicker) return null;

  return (
    <div className="from-status-warning/10 to-status-warning/5 bg-gradient-to-r">
      <div className="container mx-auto px-4 py-3">
        <div className="relative flex flex-col items-center justify-center gap-3 pr-8 lg:flex-row lg:gap-4 lg:pr-12">
          <div className="flex items-center gap-2">
            <div className="bg-status-warning flex h-5 w-5 items-center justify-center rounded-full lg:h-6 lg:w-6">
              <svg
                className="text-form-button-text h-3 w-3 lg:h-4 lg:w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <span className="text-status-warning text-xs font-semibold lg:text-sm">
              SERVICE ALERT
            </span>
          </div>

          <div className="flex flex-col items-center gap-2 lg:flex-row lg:gap-3">
            <span className="text-primary-text text-center text-xs lg:text-sm">
              <strong>Inventory API Down:</strong> The following are affected - OG Finder, Dupe
              Finder, polling bots and inventories
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
