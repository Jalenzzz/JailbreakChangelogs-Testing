"use client";

import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import XpCalculatorForm from './XpCalculatorForm';
import XpCalculatorInfo from './XpCalculatorInfo';
import XpResultsSummary from './XpResultsSummary';
import { Season, CalculationResults, DoubleXpResult } from '@/types/seasons';

interface XpCalculatorProps {
  season: Season;
}

export default function XpCalculator({ season }: XpCalculatorProps) {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentXp, setCurrentXp] = useState(0);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (results) {
      const el = document.getElementById('season-progress-summary');
      if (el) {
        const yOffset = -80; // adjust offset for fixed header
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else if (resultsRef.current) {
        // fallback
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [results]);

  const calculateXp = () => {
    setIsCalculating(true);
    // Validate current level input
    if (!currentLevel) {
      toast.error('Please enter your current level.');
      setIsCalculating(false);
      return;
    }

    // Prevent calculation if user is already at or above target level
    if (currentLevel >= season.xp_data.targetLevel) {
      toast.error(`You cannot calculate progress for level ${currentLevel}. Please enter a level below ${season.xp_data.targetLevel}.`);
      setIsCalculating(false);
      return;
    }

    const xpData = season.xp_data;
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Constants from the season data
    const constants = {
      MAX_DAILY_EXP: xpData.xp_rates.maxDailyXp,
      MAX_DAILY_EXP_SEASON_PASS: xpData.xp_rates.maxDailyXpWithPass,
      AVG_EXP_PER_CONTRACT: xpData.xp_rates.avgXpPerContract,
      TOTAL_DAYS: xpData.xp_rates.totalDays,
      CONTRACTS_PER_DAY: xpData.xp_rates.contractsPerDay,
      EFFICIENCY: xpData.xp_rates.efficiency,
      CURVE_K: xpData.xp_rates.curveK,
      DOUBLE_XP_TIME: xpData.doubleXpDuration,
      SEASON_ENDS: season.end_date,
    };

    // Calculate total possible XP
    const totalPossibleExp = constants.EFFICIENCY * (
      constants.AVG_EXP_PER_CONTRACT * constants.CONTRACTS_PER_DAY * constants.TOTAL_DAYS +
      constants.MAX_DAILY_EXP * constants.TOTAL_DAYS
    );

    // Function to get XP required for a level
    function getExpFromLevel(targetLevel: number) {
      if (targetLevel <= 0) return 0;
      
      const curveK = constants.CURVE_K;
      let result;

      if (curveK === 1) {
        result = totalPossibleExp / (xpData.targetLevel - 1);
      } else {
        result = (totalPossibleExp * (1 - curveK)) / (1 - Math.pow(curveK, xpData.targetLevel - 1));
      }

      let calculatedExp;
      if (curveK === 1) {
        calculatedExp = result * (targetLevel - 1);
      } else {
        calculatedExp = (result * (1 - Math.pow(curveK, targetLevel - 1))) / (1 - curveK);
      }

      let roundedExp = Math.floor(calculatedExp);
      if (0.5 <= calculatedExp - roundedExp) {
        roundedExp += 1;
      }
      return roundedExp;
    }

    // Calculate XP per week
    const expPerWeek = (hasGamePass: boolean) => {
      if (hasGamePass) {
        return constants.MAX_DAILY_EXP_SEASON_PASS * 7 + constants.AVG_EXP_PER_CONTRACT * 6;
      } else {
        return constants.MAX_DAILY_EXP * 7 + constants.AVG_EXP_PER_CONTRACT * 4;
      }
    };

    const expPerWeekDouble = (hasGamePass: boolean) => {
      if (hasGamePass) {
        return constants.MAX_DAILY_EXP_SEASON_PASS * 7 + constants.AVG_EXP_PER_CONTRACT * 12;
      } else {
        return constants.MAX_DAILY_EXP * 7 + constants.AVG_EXP_PER_CONTRACT * 8;
      }
    };

    // Current progress
    const myExp = getExpFromLevel(currentLevel) + currentXp;
    const targetLevelExp = getExpFromLevel(season.xp_data.targetLevel);
    const xpNeeded = targetLevelExp - myExp;

    // Time calculations
    const howLongNoGamePassDays = Math.ceil(((targetLevelExp - myExp) / expPerWeek(false)) * 7);
    const howLongWithGamePassDays = Math.ceil(((targetLevelExp - myExp) / expPerWeek(true)) * 7);
    
    const targetLevelDateNoGamePass = currentTime + howLongNoGamePassDays * 86400;
    const targetLevelDateWithGamePass = currentTime + howLongWithGamePassDays * 86400;

    // Check if achievable
    const doubleXpStart = constants.SEASON_ENDS - constants.DOUBLE_XP_TIME;
    
    // Debug logging
    console.log('Debug - Current time:', new Date(currentTime * 1000).toISOString());
    console.log('Debug - Season ends:', new Date(constants.SEASON_ENDS * 1000).toISOString());
    console.log('Debug - No pass completion:', new Date(targetLevelDateNoGamePass * 1000).toISOString());
    console.log('Debug - With pass completion:', new Date(targetLevelDateWithGamePass * 1000).toISOString());
    console.log('Debug - No pass achievable:', targetLevelDateNoGamePass < doubleXpStart);
    console.log('Debug - With pass achievable:', targetLevelDateWithGamePass < doubleXpStart);
    
    const achievableNoPass = targetLevelDateNoGamePass < constants.SEASON_ENDS;
    const achievableWithPass = targetLevelDateWithGamePass < constants.SEASON_ENDS;

    // Double XP calculations if needed
    let doubleXpResults: { noPass: DoubleXpResult; withPass: DoubleXpResult } | null = null;
    if (!achievableNoPass || !achievableWithPass) {
      const newDaysNoPass = (targetLevelExp - myExp) / expPerWeek(false) - 1 + (targetLevelExp - myExp) / expPerWeekDouble(false);
      const newLvlDateNoPass = Math.ceil(newDaysNoPass * 7) * 86400;
      const newDaysWithPass = (targetLevelExp - myExp) / expPerWeek(true) - 1 + (targetLevelExp - myExp) / expPerWeekDouble(true);
      const newLvlDateWithPass = Math.ceil(newDaysWithPass * 7) * 86400;
      
      doubleXpResults = {
        noPass: {
          achievable: currentTime + newLvlDateNoPass < constants.SEASON_ENDS,
          completionDate: new Date((currentTime + newLvlDateNoPass) * 1000).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        },
        withPass: {
          achievable: currentTime + newLvlDateWithPass < constants.SEASON_ENDS,
          completionDate: new Date((currentTime + newLvlDateWithPass) * 1000).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        }
      };
    }

    setResults({
      currentLevel,
      currentXp: myExp,
      requiredXp: targetLevelExp,
      xpNeeded,
      timeNoPass: {
        days: howLongNoGamePassDays,
        completionDate: new Date(targetLevelDateNoGamePass * 1000).toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      },
      timeWithPass: {
        days: howLongWithGamePassDays,
        completionDate: new Date(targetLevelDateWithGamePass * 1000).toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      },
      achievableNoPass,
      achievableWithPass,
      doubleXpResults,
      importantDates: {
        doubleXpStart: new Date(doubleXpStart * 1000).toLocaleString(undefined, {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        }),
        seasonEnds: new Date(constants.SEASON_ENDS * 1000).toLocaleString(undefined, {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        })
      }
    });

    toast.success('Results updated below.');
    setIsCalculating(false);
  };

  return (
    <>
      <XpCalculatorInfo />
      <XpCalculatorForm
        currentLevel={currentLevel}
        currentXp={currentXp}
        targetLevel={season.xp_data.targetLevel}
        onLevelChange={setCurrentLevel}
        onXpChange={setCurrentXp}
        onCalculate={calculateXp}
        isCalculating={isCalculating}
      />

      <div ref={resultsRef}>
        {results && <XpResultsSummary results={results} />}
      </div>
    </>
  );
} 