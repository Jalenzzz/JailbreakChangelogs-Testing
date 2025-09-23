import React from 'react';

const ChangelogHeader: React.FC = () => {
  return (
    <div className="bg-secondary-bg border-border-primary mb-8 rounded-lg border p-6">
      <div className="mb-4">
        <h2 className="text-secondary-text text-2xl font-semibold">
          Roblox Jailbreak Changelogs & Update History
        </h2>
      </div>
      <p className="text-secondary-text mb-4">
        Welcome to our comprehensive collection of Roblox Jailbreak changelogs! Track every update,
        feature release, and game modification in Jailbreak&apos;s history. Some updates and
        features may be unaccounted for, as they may not have been directly announced by Badimo.
      </p>
    </div>
  );
};

export default ChangelogHeader;
