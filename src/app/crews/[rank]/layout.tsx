import { Metadata } from 'next';
import { fetchCrewLeaderboard, AVAILABLE_CREW_SEASONS } from '@/utils/api';
import { getMaintenanceMetadata } from '@/utils/maintenance';

interface CrewRankLayoutProps {
  params: Promise<{
    rank: string;
  }>;
  searchParams: Promise<{ season?: string }>;
}

export async function generateMetadata({ params, searchParams }: CrewRankLayoutProps): Promise<Metadata> {
  // Check for maintenance mode first
  const maintenanceMetadata = await getMaintenanceMetadata();
  if (maintenanceMetadata) {
    return maintenanceMetadata;
  }

  // Extract rank from params first
  const { rank } = await params;

  try {
    const rankNumber = parseInt(rank);
    const resolvedSearchParams = await searchParams;
    const seasonParam = resolvedSearchParams.season;
    const selectedSeason = seasonParam ? parseInt(seasonParam, 10) : 19;
    
    // Validate season parameter
    const validSeason = AVAILABLE_CREW_SEASONS.includes(selectedSeason) ? selectedSeason : 19;
    
    const leaderboard = await fetchCrewLeaderboard(validSeason);
    const crew = leaderboard[rankNumber - 1]; // Convert 1-based rank to 0-based index

    if (!crew) {
      return {
        metadataBase: new URL('https://jailbreakchangelogs.xyz'),
        title: 'Crew Not Found - Jailbreak Changelogs',
        description: 'The requested crew could not be found.',
        alternates: {
          canonical: `/crews/${rank}`,
        },
      };
    }

    const seasonText = validSeason === 19 ? '' : ` (Season ${validSeason})`;
    const seasonDescription = validSeason === 19 ? '' : ` from Season ${validSeason}`;

    return {
      metadataBase: new URL('https://jailbreakchangelogs.xyz'),
      title: `${crew.ClanName} - Rank #${rank}${seasonText} - Jailbreak Changelogs`,
      description: `${crew.ClanName} is ranked #${rank} in Jailbreak${seasonDescription} with a rating of ${Math.round(crew.Rating)} and ${crew.BattlesPlayed} battles played.`,
      alternates: {
        canonical: `/crews/${rank}${validSeason !== 19 ? `?season=${validSeason}` : ''}`,
      },
      openGraph: {
        title: `${crew.ClanName} - Rank #${rank}${seasonText}`,
        description: `${crew.ClanName} is ranked #${rank} in Jailbreak${seasonDescription} with a rating of ${Math.round(crew.Rating)} and ${crew.BattlesPlayed} battles played.`,
        type: 'website',
        siteName: 'Jailbreak Changelogs',
        url: `/crews/${rank}${validSeason !== 19 ? `?season=${validSeason}` : ''}`,
        images: [
          {
            url: `/api/og/crew?rank=${rank}`,
            width: 1200,
            height: 630,
            alt: `${crew.ClanName} - Rank #${rank}${seasonText}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${crew.ClanName} - Rank #${rank}${seasonText}`,
        description: `${crew.ClanName} is ranked #${rank} in Jailbreak${seasonDescription} with a rating of ${Math.round(crew.Rating)} and ${crew.BattlesPlayed} battles played.`,
        images: [`/api/og/crew?rank=${rank}`],
      },
    };
  } catch {
    return {
      metadataBase: new URL('https://jailbreakchangelogs.xyz'),
      title: 'Crew Not Found - Jailbreak Changelogs',
      description: 'The requested crew could not be found.',
      alternates: {
        canonical: `/crews/${rank}`,
      },
    };
  }
}

export default function CrewRankLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
