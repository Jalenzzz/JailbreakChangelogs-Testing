'use client';

import { useState } from 'react';
import { useEscapeLogin } from '@/utils/escapeLogin';

export default function EscapeLoginModal() {
  const { showModal, setShowModal, handleTokenSubmit } = useEscapeLogin();
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await handleTokenSubmit(token);
    if (!result.success) {
      setError('Invalid token. Please try again.');
      setIsLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
      <div className="relative w-full max-w-md rounded-lg p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <h2 className="text-muted text-xl font-semibold">Login with Token</h2>
          <button onClick={() => setShowModal(false)} className="text-muted hover: rounded-md p-1">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="token" className="text-muted mb-2 block text-sm font-medium">
              Enter your token
            </label>
            <input
              type="text"
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="text-muted w-full rounded-md border px-3 py-2 placeholder-[#FFFFFF] focus:border-[#5865F2] focus:outline-none"
              placeholder="Enter your token"
            />
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="text-muted hover: rounded-md px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-white transition-all duration-200 ${
                isLoading ? 'cursor-progress bg-[#37424D]' : 'bg-[#5865F2] hover:bg-[#4752C4]'
              }`}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
