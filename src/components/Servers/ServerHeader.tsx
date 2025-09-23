import React from 'react';

const ServerHeader: React.FC = () => {
  return (
    <div className="border-stroke bg-secondary-bg mb-8 rounded-lg border p-6">
      <h2 className="text-primary-text mb-4 text-2xl font-semibold">
        Roblox Jailbreak Private Servers
      </h2>
      <p className="text-secondary-text mb-4">
        Welcome to our Private Servers hub! Connect with fellow Jailbreak players in dedicated
        trading and gaming spaces. Browse through community-shared servers, or share your own to
        build the ultimate Jailbreak trading community.
      </p>
      <p className="text-secondary-text mb-8">
        To submit, edit, or delete servers, please log in to your JBCL account. This helps us
        maintain a reliable trading environment.
      </p>
      <div className="border-button-info bg-button-info/10 mb-2 flex items-start gap-4 rounded-lg border p-4 shadow-sm">
        <div className="relative z-10">
          <span className="text-primary-text text-base font-bold">
            Important for Joining VIP Servers
          </span>
          <div className="text-secondary-text mt-1">
            For you to join a VIP server link, please make sure you have your{' '}
            <span className="text-primary-text font-semibold">
              &apos;Who can invite me to private servers?&apos;
            </span>{' '}
            setting set to <span className="text-primary-text font-semibold">Everyone</span>!
            <br />
            <span className="text-primary-text font-semibold">
              You have to be 13 or over to change this setting.
            </span>
            <br />
            You can change that setting here:{' '}
            <a
              href="https://www.roblox.com/my/account#!/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-button-info hover:text-button-info-hover font-semibold underline transition-colors"
            >
              Roblox Privacy Settings
            </a>
            .
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerHeader;
