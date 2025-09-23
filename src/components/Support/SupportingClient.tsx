'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { TrophyIcon, CheckIcon } from '@heroicons/react/24/solid';
import { RobloxIcon } from '@/components/Icons/RobloxIcon';
import { getAllowedFileExtensions } from '@/config/settings';
import SupportersSection from '@/components/Support/SupportersSection';
import { Supporter } from '@/utils/api';

interface SupporterTier {
  name: string;
  price: string;
  priceAlt?: string;
  features: string[];
  recommended?: boolean;
  tierNumber?: number;
}

interface SupportingClientProps {
  supporters: Supporter[];
}

const supporterTiers: SupporterTier[] = [
  {
    name: 'Free',
    price: '$0',
    features: [
      'Post Comments up to 200 characters',
      'Trade Ad Duration: 6 Hours',
      'Get your trade ads featured in our Discord for maximum reach.',
    ],
    tierNumber: 0,
  },
  {
    name: 'Supporter I',
    price: '$1',
    priceAlt: 'or 100R$ on Roblox',
    features: [
      '**All Free tier benefits**',
      'Hide all advertisements',
      'Post Comments up to 400 characters',
      'Trade Ad Duration: +6 Hours (12 Hours total)',
      'Custom Supporter Badge',
      'Discord Role: Supporter',
      'Comments highlighted with Bronze border and badge',
      'Get your trade ads featured in our Discord for maximum reach (highlighted to stand out)',
    ],
    tierNumber: 1,
  },
  {
    name: 'Supporter II',
    price: '$3',
    priceAlt: 'or 200R$ on Roblox',
    features: [
      '**All Supporter I benefits**',
      'Post Comments up to 800 characters',
      'Trade Ad Duration: +12 Hours (24 Hours total)',
      `Upload and Use Custom Banners (${getAllowedFileExtensions()})`,
      `Upload and Use Custom Avatars (${getAllowedFileExtensions()})`,
      'On-Demand Inventory Refresh (Coming Soon)',
      'Use inventory commands outside our Discord server',
      'Comments highlighted with Silver border and badge',
    ],
    recommended: true,
    tierNumber: 2,
  },
  {
    name: 'Supporter III',
    price: '$5',
    priceAlt: 'or 400R$ on Roblox',
    features: [
      '**All Supporter II benefits**',
      'Post Comments up to 2,000 characters',
      'Trade Ad Duration: +24 Hours (48 Hours total)',
      'Comments highlighted with Gold border and badge',
      'Square Avatar Border',
      'On-Demand Inventory Refresh (Coming Soon)',
    ],
    tierNumber: 3,
  },
];

export default function SupportingClient({ supporters }: SupportingClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [highlightedTier, setHighlightedTier] = useState<number | null>(null);

  useEffect(() => {
    const tierParam = searchParams.get('tier');

    if (tierParam) {
      const tierNumber = parseInt(tierParam, 10);

      // Validate tier parameter (1, 2, or 3)
      if ([1, 2, 3].includes(tierNumber)) {
        // Set timeout to highlight the tier after a slight delay
        const timeoutId = setTimeout(() => {
          setHighlightedTier(tierNumber);

          // Clear highlight after 5 seconds
          setTimeout(() => {
            setHighlightedTier(null);
          }, 5000);
        }, 500); // 500ms delay

        // Clean up URL parameter after highlighting
        setTimeout(() => {
          router.replace('/supporting', { scroll: false });
        }, 2000); // Clean up after 2 seconds

        return () => clearTimeout(timeoutId);
      } else {
        // Invalid tier parameter, clean up URL
        router.replace('/supporting', { scroll: false });
      }
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen pb-8">
      <div className="container mx-auto mb-8 max-w-[1920px] px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-primary-text mb-4 text-4xl font-bold">
            Support Jailbreak Changelogs
          </h1>

          <div className="mx-auto mb-8 flex max-w-4xl flex-col items-stretch justify-center gap-6 md:flex-row">
            <div className="border-border-primary bg-button-info/10 flex-1 rounded-lg border p-4 shadow-sm">
              <div className="mb-2 flex items-start gap-4">
                <div className="relative z-10">
                  <span className="text-primary-text text-base font-bold">
                    Important Information
                  </span>
                  <div className="text-secondary-text mt-1">
                    All supporter purchases are one-time only and non-refundable! Once you purchase,
                    you keep the perks forever.
                    <br />
                    <strong>Ko-fi Supporters:</strong> If you&apos;re buying a supporter tier using{' '}
                    <a
                      href="https://ko-fi.com/jbchangelogs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-button-info hover:text-button-info-hover font-semibold underline transition-colors"
                    >
                      Ko-fi
                    </a>
                    ,{' '}
                    <span className="font-bold">
                      ensure your Discord user ID is in parenthesis inside your message
                    </span>{' '}
                    (e.g., <code>Hello there! (1019539798383398946)</code>). This is required to
                    receive your code!
                    <br />
                    <Link
                      href="/redeem"
                      className="text-button-info hover:text-button-info-hover underline transition-colors"
                    >
                      After purchase, redeem your code here
                    </Link>
                    .
                  </div>
                </div>
              </div>
            </div>

            <div className="border-border-primary bg-secondary-bg flex flex-1 flex-col justify-center rounded-lg border p-4">
              <p className="text-secondary-text">
                By supporting Jailbreak Changelogs, you&apos;re helping us maintain and improve this
                open-source project, community made for Roblox Jailbreak. Your support enables us to
                continue providing accurate, timely updates and new features to help the community
                stay informed about their favorite game.
              </p>
              <span className="text-tertiary-text mt-4 text-right text-sm italic">
                — Jakobiis and Jalenzz
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="grid flex-grow grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
            {supporterTiers.map((tier) => (
              <div
                key={tier.name}
                className={`bg-secondary-bg overflow-hidden rounded-lg shadow-lg transition-all duration-500 ${
                  tier.recommended
                    ? 'border-button-info scale-105 transform border-2'
                    : 'border-border-primary border'
                } ${
                  highlightedTier === tier.tierNumber
                    ? 'ring-opacity-75 ring-warning scale-110 transform ring-4'
                    : ''
                } `}
              >
                {tier.recommended && (
                  <div className="bg-button-info text-form-button-text py-2 text-center font-semibold">
                    Recommended
                  </div>
                )}
                <div className="p-6">
                  <div className="mb-2 flex items-center gap-2">
                    <h2 className="text-primary-text text-2xl font-bold">{tier.name}</h2>
                    {tier.name !== 'Free' && (
                      <div
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
                          tier.name === 'Supporter I'
                            ? 'bg-gradient-to-r from-[#CD7F32] to-[#B87333]' // Bronze
                            : tier.name === 'Supporter II'
                              ? 'bg-gradient-to-r from-[#C0C0C0] to-[#A9A9A9]' // Silver
                              : 'bg-gradient-to-r from-[#FFD700] to-[#DAA520]' // Gold
                        }`}
                      >
                        <TrophyIcon className="h-4 w-4 text-black" />
                      </div>
                    )}
                  </div>
                  <div className="mb-4">
                    {tier.price === '$0' ? (
                      <span className="text-primary-text text-3xl font-bold">{tier.price}</span>
                    ) : (
                      <div className="flex items-center">
                        <span className="text-primary-text text-3xl font-bold">{tier.price}</span>
                      </div>
                    )}
                    {tier.priceAlt && (
                      <div className="flex items-center gap-1">
                        <span className="text-tertiary-text text-sm">
                          {tier.priceAlt.replace(' on Roblox', '').replace('R$', '')}
                        </span>
                        <Image
                          src="/assets/images/Robux_Icon.png"
                          alt="Robux"
                          width={16}
                          height={16}
                          className="ml-1"
                        />
                      </div>
                    )}
                  </div>
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckIcon className="mt-1 mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                        <span
                          className={`${feature.startsWith('**') ? 'text-primary-text font-bold' : 'text-secondary-text'}`}
                        >
                          {feature.replace(/\*\*/g, '')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="flex-shrink-0 lg:w-80">
            <div className="border-border-primary bg-secondary-bg sticky top-8 rounded-lg border p-6 shadow-lg">
              <h2 className="text-primary-text mb-6 text-center text-xl font-bold">
                Ready to Support?
              </h2>
              <div className="space-y-8">
                <div className="text-center">
                  <h3 className="text-primary-text mb-3 text-lg font-semibold">Ko-fi Donations</h3>
                  <Image
                    src="https://assets.jailbreakchangelogs.xyz/assets/images/kofi_assets/kofi_symbol.svg"
                    alt="Ko-fi Symbol"
                    width={40}
                    height={40}
                    className="mx-auto mb-2"
                  />
                  <Image
                    src="https://assets.jailbreakchangelogs.xyz/assets/images/support/KoFi_Supporter_QR_Code.webp"
                    alt="Ko-fi Support QR Code"
                    width={192}
                    height={192}
                    className="mx-auto rounded-lg shadow"
                  />
                  <a
                    href="https://ko-fi.com/jailbreakchangelogs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link hover:text-link-hover mt-2 inline-block text-sm"
                  >
                    Can&apos;t scan? Click here
                  </a>
                </div>
                <div className="text-center">
                  <h3 className="text-primary-text mb-3 text-lg font-semibold">Roblox Donations</h3>
                  <RobloxIcon className="mx-auto mb-2 h-10 w-10" />
                  <Image
                    src="https://assets.jailbreakchangelogs.xyz/assets/images/support/Roblox_Supporter_QR_Code.webp"
                    alt="Roblox Support QR Code"
                    width={192}
                    height={192}
                    className="mx-auto rounded-lg shadow"
                  />
                  <a
                    href="https://www.roblox.com/games/104188650191561/Support-Us"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link hover:text-link-hover mt-2 inline-block text-sm"
                  >
                    Can&apos;t scan? Click here
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SupportersSection supporters={supporters} />
    </div>
  );
}
