import React from 'react';
import Breadcrumb from '@/components/Layout/Breadcrumb';
import SeasonContractsClient from '@/components/Seasons/SeasonContractsClient';
import { fetchSeasonContracts } from '@/utils/api';

export const revalidate = 300; // Revalidate every 5 minutes

export default async function SeasonContractsPage() {
  const contractsData = await fetchSeasonContracts();

  if (!contractsData || !contractsData.data || contractsData.data.length === 0) {
    return (
      <div className="min-h-screen bg-[#2E3944] flex items-center justify-center">
        <div className="text-white text-xl">No contracts available right now.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2E3944]">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb />

        <div className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-white">Weekly Contracts</h1>
            <span className="text-[12px] uppercase font-semibold text-white bg-[#5865F2] px-2 py-1 rounded">New</span>
          </div>
          <p className="text-gray-300 text-lg mb-8">
            Quickly check your current weekly contracts for Roblox Jailbreak.
          </p>
        </div>

        <SeasonContractsClient contracts={contractsData.data} updatedAt={contractsData.updated_at} />
      </div>
    </div>
  );
}


