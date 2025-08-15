import Image from 'next/image';

interface XpCalculatorFormProps {
  currentLevel: number;
  currentXp: number;
  targetLevel: number;
  onLevelChange: (level: number) => void;
  onXpChange: (xp: number) => void;
  onCalculate: () => void;
}

export default function XpCalculatorForm({
  currentLevel,
  currentXp,
  targetLevel,
  onLevelChange,
  onXpChange,
  onCalculate
}: XpCalculatorFormProps) {
  return (
    <div className="mb-8 rounded-lg border border-[#2E3944] bg-[#212A31] p-6">
      <h2 className="mb-6 text-2xl font-semibold text-[#FFFFFF]">🎯 XP Progress Calculator</h2>
      
      {/* Example image showing how to get XP values */}
      <div className="mb-6 text-center">
        <Image 
          src="/assets/images/Season_Exp.png" 
          alt="Example showing how to find your current level and XP in Roblox Jailbreak"
          width={400}
          height={300}
          className="mx-auto w-full max-w-sm rounded-lg border border-[#2E3944]"
          priority
          unoptimized
        />
        <p className="mt-2 text-sm text-muted">
          💡 Use this image as a reference to find your current level and XP progress
        </p>
      </div>
      
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#FFFFFF]">Current Level</label>
          <input
            type="number"
            min="1"
            max={targetLevel - 1}
            value={currentLevel || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '') {
                // Allow empty input
                onLevelChange(0);
              } else {
                const newLevel = parseInt(value);
                if (!isNaN(newLevel) && newLevel >= 1 && newLevel < targetLevel) {
                  onLevelChange(newLevel);
                }
              }
            }}
            className="w-full rounded border border-[#2E3944] bg-[#2E3944] px-3 py-2 text-[#FFFFFF] focus:border-[#124E66] focus:outline-none"
            placeholder="Enter your current level"
          />
          <div className="mt-1 text-xs text-muted">
            Enter your current level (1-{targetLevel - 1})
          </div>
        </div>
        
        <div>
          <label className="mb-2 block text-sm font-medium text-[#FFFFFF]">XP in Current Level</label>
          <input
            type="number"
            min="0"
            value={currentXp}
            onChange={(e) => onXpChange(parseInt(e.target.value) || 0)}
            className="w-full rounded border border-[#2E3944] bg-[#2E3944] px-3 py-2 text-[#FFFFFF] focus:border-[#124E66] focus:outline-none"
            placeholder="373"
          />
          <div className="mt-1 text-xs text-muted">
            XP progress within your current level (e.g., 373 XP in level 5)
          </div>
        </div>
      </div>

      <button
        onClick={onCalculate}
        className="w-full rounded-lg bg-[#124E66] px-6 py-3 font-semibold text-[#FFFFFF] transition-colors hover:bg-[#0D3A4A]"
      >
        🚀 Calculate My Progress
      </button>
    </div>
  );
} 