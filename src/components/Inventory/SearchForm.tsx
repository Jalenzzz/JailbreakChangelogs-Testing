'use client';

interface SearchFormProps {
  searchId: string;
  setSearchId: (value: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  isLoading: boolean;
  externalIsLoading: boolean;
  error?: string;
  isCompact?: boolean;
}

export default function SearchForm({
  searchId,
  setSearchId,
  handleSearch,
  isLoading,
  externalIsLoading,
  error,
  isCompact = false
}: SearchFormProps) {
  return (
    <div className="bg-[#212A31] rounded-lg border border-[#2E3944] p-6">
      <form onSubmit={handleSearch} className={isCompact ? "space-y-4" : "flex flex-col sm:flex-row gap-4"}>
        <div className={isCompact ? "" : "flex-1"}>
          <label htmlFor={isCompact ? "robloxId" : "searchInput"} className="block text-sm font-medium text-muted mb-2">
            Username or Roblox ID
          </label>
          <input
            type="text"
            id={isCompact ? "robloxId" : "searchInput"}
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter username or Roblox ID (e.g., v3kmw or 1910948809)"
            className="w-full px-3 py-2 border border-[#2E3944] bg-[#37424D] rounded-lg shadow-sm focus:outline-none focus:border-[#5865F2] text-muted placeholder-[#D3D9D4]"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || externalIsLoading}
          className={isCompact 
            ? "w-full bg-[#5865F2] hover:bg-[#4752C4] disabled:bg-[#2E3944] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            : "bg-[#5865F2] hover:bg-[#4752C4] disabled:bg-[#2E3944] text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2 sm:w-auto w-full"
          }
        >
          {(isLoading || externalIsLoading) && (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isLoading || externalIsLoading ? (isCompact ? 'Searching...' : 'Searching...') : (isCompact ? 'Check Inventory' : 'Search')}
        </button>
      </form>
      
      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
          <p className={`text-red-300 text-sm ${isCompact ? 'whitespace-pre-line' : ''}`}>{error}</p>
        </div>
      )}
    </div>
  );
}
