'use client';

import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import {
  ChatBubbleLeftRightIcon,
  CommandLineIcon,
  BoltIcon,
  CalendarIcon,
  DocumentTextIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';
import { GiTrophy } from 'react-icons/gi';
import Link from 'next/link';
import { generateShuffledBackgroundImages } from '@/utils/fisherYatesShuffle';

export default function BotPage() {
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Generate shuffled array of background images
    const shuffledImages = generateShuffledBackgroundImages();
    setBackgroundImages(shuffledImages);
  }, []);

  // Function to cycle to the next image
  const nextImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex + 1 >= backgroundImages.length ? 0 : prevIndex + 1,
    );
  }, [backgroundImages.length]);

  // Auto-cycle through images every 10 seconds
  useEffect(() => {
    if (backgroundImages.length === 0) return;

    const interval = setInterval(nextImage, 10000);
    return () => clearInterval(interval);
  }, [backgroundImages.length, nextImage]);

  const currentBackgroundImage = backgroundImages[currentImageIndex] || '';

  return (
    <main className="bg-primary-bg min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          {currentBackgroundImage && (
            <Image
              src={currentBackgroundImage}
              alt="Jailbreak Background"
              fill
              className="object-cover transition-opacity duration-1000"
              style={{ objectPosition: 'center 70%' }}
              priority
            />
          )}
          <div
            className="absolute inset-0 z-10"
            style={{ backgroundColor: 'var(--color-hero-overlay)' }}
          ></div>
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center">
            <h1
              className="mb-6 text-3xl font-bold md:text-5xl"
              style={{ color: 'var(--color-form-button-text)' }}
            >
              Welcome to our Discord Bot Page
            </h1>
            <p
              className="mx-auto mb-8 max-w-2xl text-base md:text-lg"
              style={{ color: 'var(--color-form-button-text)' }}
            >
              Your go-to resource for information and updates about our Discord bot!
            </p>

            {/* Achievement Banner */}
            <div className="mx-auto mb-8 max-w-2xl">
              <div className="from-tertiary via-tertiary to-tertiary relative overflow-hidden rounded-xl bg-gradient-to-r p-1">
                <div className="bg-secondary-bg border-border-primary rounded-lg border p-4">
                  <div className="flex flex-col items-center gap-3 text-center md:flex-row md:justify-center">
                    <div className="flex items-center gap-2">
                      <div>
                        <h2 className="text-card-headline flex items-center gap-2 text-lg font-bold md:text-xl">
                          <GiTrophy className="text-tertiary h-6 w-6" />
                          #1 Roblox Jailbreak Bot
                        </h2>
                        <p className="text-card-paragraph text-xs md:text-sm">
                          The most popular Discord bot for Jailbreak servers
                        </p>
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <span className="text-tertiary-text">|</span>
                    </div>
                    <div className="text-center md:text-left">
                      <p className="text-tertiary text-sm font-semibold md:text-base">
                        Most Servers Added
                      </p>
                      <p className="text-card-paragraph text-xs">
                        Trusted by Jailbreak communities
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <a
              href="https://discord.com/discovery/applications/1281308669299920907"
              target="_blank"
              rel="noopener noreferrer"
              className="text-form-button-text bg-button-info hover:bg-button-info-hover active:bg-button-info-active focus:ring-border-focus inline-block rounded-lg px-8 py-3 text-lg font-semibold transition-colors duration-200 focus:ring-2 focus:outline-none"
            >
              Invite to Your Server
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-primary-text mb-12 text-center text-3xl font-bold">Bot Features</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-secondary-bg border-border-primary hover:border-border-focus hover:shadow-card-shadow rounded-lg border p-6 transition-colors duration-200 hover:shadow-lg">
              <div className="mb-4 flex items-center gap-2">
                <CalendarIcon className="text-link h-6 w-6" />
                <h3 className="text-card-headline text-xl font-semibold">Season Tracking</h3>
              </div>
              <p className="text-card-paragraph">
                Remove the hassle of visiting the website! With season tracking, you can view all
                the latest season content directly from the Discord bot.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-secondary-bg border-border-primary hover:border-border-focus hover:shadow-card-shadow rounded-lg border p-6 transition-colors duration-200 hover:shadow-lg">
              <div className="mb-4 flex items-center gap-2">
                <DocumentTextIcon className="text-link h-6 w-6" />
                <h3 className="text-card-headline text-xl font-semibold">Changelog Tracking</h3>
              </div>
              <p className="text-card-paragraph">
                Stay informed about the latest updates and changes without the hassle of visiting
                external sites. Get instant updates on changelogs right from the bot.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-secondary-bg border-border-primary hover:border-border-focus hover:shadow-card-shadow rounded-lg border p-6 transition-colors duration-200 hover:shadow-lg">
              <div className="mb-4 flex items-center gap-2">
                <ArrowsRightLeftIcon className="text-link h-6 w-6" />
                <h3 className="text-card-headline text-xl font-semibold">Item Tracking</h3>
              </div>
              <p className="text-card-paragraph">
                Use /item and /items commands to track specific items or browse all available items
                in Jailbreak. View detailed item information directly through Discord!
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-secondary-bg border-border-primary hover:border-border-focus hover:shadow-card-shadow rounded-lg border p-6 transition-colors duration-200 hover:shadow-lg">
              <div className="mb-4 flex items-center gap-2">
                <BoltIcon className="text-link h-6 w-6" />
                <h3 className="text-card-headline text-xl font-semibold">Fast & Efficient</h3>
              </div>
              <p className="text-card-paragraph">
                Optimized for performance with quick res ponse times and efficient resource usage to
                keep your server running smoothly.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-secondary-bg border-border-primary hover:border-border-focus hover:shadow-card-shadow rounded-lg border p-6 transition-colors duration-200 hover:shadow-lg">
              <div className="mb-4 flex items-center gap-2">
                <CommandLineIcon className="text-link h-6 w-6" />
                <h3 className="text-card-headline text-xl font-semibold">Easy Commands</h3>
              </div>
              <p className="text-card-paragraph">
                Access Jailbreak information quickly with simple commands. Check values, view
                changelogs, and more with intuitive slash commands.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-secondary-bg border-border-primary hover:border-border-focus hover:shadow-card-shadow rounded-lg border p-6 transition-colors duration-200 hover:shadow-lg">
              <div className="mb-4 flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="text-link h-6 w-6" />
                <h3 className="text-card-headline text-xl font-semibold">Trade Notifications</h3>
              </div>
              <p className="text-card-paragraph">
                Get DMs from users who want to trade with you from our trading page when you make a
                trade ad.
              </p>
            </div>
          </div>
          <div className="mt-12 text-center">
            <p className="text-tertiary-text flex items-center justify-center gap-1">
              Bot made with{' '}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                className="inline"
              >
                <path
                  fill="#1d80e2"
                  fillOpacity="0"
                  d="M12 8c0 0 0 0 0.76 -1c0.88 -1.16 2.18 -2 3.74 -2c2.49 0 4.5 2.01 4.5 4.5c0 0.93 -0.28 1.79 -0.76 2.5c-0.81 1.21 -8.24 9 -8.24 9c0 0 -7.43 -7.79 -8.24 -9c-0.48 -0.71 -0.76 -1.57 -0.76 -2.5c0 -2.49 2.01 -4.5 4.5 -4.5c1.56 0 2.87 0.84 3.74 2c0.76 1 0.76 1 0.76 1Z"
                >
                  <animate
                    fill="freeze"
                    attributeName="fill-opacity"
                    begin="0.7s"
                    dur="0.5s"
                    values="0;1"
                  />
                </path>
                <path
                  fill="none"
                  stroke="#1d80e2"
                  strokeDasharray="32"
                  strokeDashoffset="32"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c0 0 0 0 -0.76 -1c-0.88 -1.16 -2.18 -2 -3.74 -2c-2.49 0 -4.5 2.01 -4.5 4.5c0 0.93 0.28 1.79 0.76 2.5c0.81 1.21 8.24 9 8.24 9M12 8c0 0 0 0 0.76 -1c0.88 -1.16 2.18 -2 3.74 -2c2.49 0 4.5 2.01 4.5 4.5c0 0.93 -0.28 1.79 -0.76 2.5c-0.81 1.21 -8.24 9 -8.24 9"
                >
                  <animate
                    fill="freeze"
                    attributeName="stroke-dashoffset"
                    dur="0.7s"
                    values="32;0"
                  />
                </path>
              </svg>
              {' by '}
              <Link
                href="/users/659865209741246514"
                className="text-link hover:text-link-hover active:text-link-active transition-colors duration-200 hover:underline"
              >
                Jakobiis
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
