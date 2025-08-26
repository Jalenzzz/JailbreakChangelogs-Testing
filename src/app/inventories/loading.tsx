

export default function InventoryCheckerLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
          
          {/* Search Form Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>

          {/* User Stats Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Items Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
            
            {/* Filter Controls Skeleton */}
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/2 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-full sm:w-1/2 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>

            {/* Cards Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-700 border-2 border-gray-800 rounded-lg p-4">
                  {/* Title Section */}
                  <div className="text-center mb-4">
                    <div className="h-6 bg-gray-600 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-600 rounded w-1/2 mx-auto"></div>
                  </div>
                  
                  {/* Statistics Section */}
                  <div className="space-y-3 text-center">
                    <div>
                      <div className="h-3 bg-gray-600 rounded w-24 mx-auto mb-1"></div>
                      <div className="h-6 bg-gray-600 rounded w-16 mx-auto"></div>
                    </div>
                    <div>
                      <div className="h-3 bg-gray-600 rounded w-24 mx-auto mb-1"></div>
                      <div className="h-6 bg-gray-600 rounded w-16 mx-auto"></div>
                    </div>
                    <div>
                      <div className="h-3 bg-gray-600 rounded w-28 mx-auto mb-1"></div>
                      <div className="h-6 bg-gray-600 rounded w-12 mx-auto"></div>
                    </div>
                  </div>
                  
                  {/* Season/Level Badges Section */}
                  <div className="flex justify-center gap-2 mt-3 pt-3 border-t border-gray-600">
                    <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                    <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
