import { fetchSeasonsList, Season } from '@/utils/api';
import SeasonDetailsClient from '@/components/Seasons/SeasonDetailsClient';
import { notFound, redirect } from 'next/navigation';

export const revalidate = 120; // Revalidate every 2 minutes

const LATEST_SEASON = 27;

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function SeasonDetailsPage({ params }: Props) {
  const { id } = await params;
  
  try {
    const seasonListPromise = fetchSeasonsList();
    
    // Wait for the season list to resolve
    const seasonList = await seasonListPromise;
    
    // Find the current season in the list, handling leading zeros
    const currentSeason = seasonList.find((season: Season) => season.season.toString() === id || season.season === parseInt(id));
    
    if (!currentSeason) {
      notFound();
    }

    // Check if the season has valid rewards
    if (typeof currentSeason.rewards === 'string' || !Array.isArray(currentSeason.rewards) || currentSeason.rewards.length === 0) {
      // Redirect to latest season if current season has no rewards
      const latestSeason = seasonList.find((s: Season) => s.season === LATEST_SEASON);
      if (latestSeason) {
        redirect(`/seasons/${latestSeason.season}`);
      } else {
        redirect(`/seasons/${LATEST_SEASON}`);
      }
    }

    return (
      <SeasonDetailsClient 
        seasonList={seasonList}
        currentSeason={currentSeason}
        seasonId={id}
        latestSeasonNumber={LATEST_SEASON}
      />
    );
  } catch (error) {
    console.error('Error fetching season:', error);
    notFound();
  }
} 