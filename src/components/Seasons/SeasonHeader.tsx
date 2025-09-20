import React from 'react';
import SeasonCountdown from './SeasonCountdown';

interface Reward {
  id: number;
  season_number: number;
  item: string;
  requirement: string;
  link: string;
  exclusive: string;
  bonus: string;
}

interface Season {
  season: number;
  title: string;
  start_date: number;
  end_date: number;
  description: string;
  rewards: Reward[];
}

interface SeasonHeaderProps {
  currentSeason: Season | null;
  nextSeason: Season | null;
}

const SeasonHeader: React.FC<SeasonHeaderProps> = ({ currentSeason, nextSeason }) => {
  return (
    <div className="border-stroke bg-secondary-bg mb-8 rounded-lg border p-6">
      <div className="mb-4">
        <h2 className="text-secondary-text text-2xl font-semibold">
          Roblox Jailbreak Season Archives
        </h2>
      </div>
      <p className="text-secondary-text mb-4">
        Explore every season of Roblox Jailbreak! Each season brings exciting limited-time rewards,
        exclusive vehicles, and unique customization items. Level up, earn XP, and unlock special
        prizes during these time-limited events.
      </p>

      <div className="mb-8">
        <SeasonCountdown currentSeason={currentSeason} nextSeason={nextSeason} />
      </div>
    </div>
  );
};

export default SeasonHeader;
