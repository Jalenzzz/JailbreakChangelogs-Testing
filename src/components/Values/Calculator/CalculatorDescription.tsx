import React from 'react';
import Link from 'next/link';

const CalculatorDescription: React.FC = () => {
  return (
    <div className="mb-8 rounded-lg border bg-[#212A31] p-6">
      <div className="mb-4">
        <h2 className="text-muted text-2xl font-semibold">Roblox Jailbreak Value Calculator</h2>
      </div>
      <p className="text-muted mb-6">
        Calculate the value of your Roblox Jailbreak items and trades. Get accurate market values
        and make informed trading decisions.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/values"
          className="text-muted inline-flex items-center rounded-lg border bg-[#37424D] px-4 py-2 text-sm font-medium transition-colors hover:bg-[#124E66] hover:text-white"
        >
          View Item Values
        </Link>
        <Link
          href="/trading"
          className="text-muted inline-flex items-center rounded-lg border bg-[#37424D] px-4 py-2 text-sm font-medium transition-colors hover:bg-[#124E66] hover:text-white"
        >
          Create A Trade Ad
        </Link>
      </div>
    </div>
  );
};

export default CalculatorDescription;
