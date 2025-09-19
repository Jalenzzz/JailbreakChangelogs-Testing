import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Header from '@/components/Layout/Header';
import NewsTicker from '@/components/Layout/NewsTicker';
import MaintenanceBypass from '@/components/Layout/MaintenanceBypass';
import Footer from '@/components/Layout/Footer';
import OfflineDetector from '@/components/OfflineDetector';
import { Toaster } from 'react-hot-toast';
import NextTopLoader from 'nextjs-toploader';
import AuthCheck from '@/components/Auth/AuthCheck';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import SurveyProvider from '@/components/Survey/SurveyProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { checkMaintenanceMode, getMaintenanceMetadata } from '@/utils/maintenance';
import { Suspense } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';

const inter = Inter({ subsets: ['latin'] });
export const viewport: Viewport = {
  themeColor: 'var(--color-button-info)',
};

export async function generateMetadata(): Promise<Metadata> {
  const maintenanceMetadata = await getMaintenanceMetadata();
  if (maintenanceMetadata) {
    return maintenanceMetadata;
  }

  return {
    metadataBase: new URL('https://jailbreakchangelogs.xyz'),
    title: {
      template: '%s',
      default: 'Latest Updates & Patch Notes | Changelogs',
    },
    description:
      'Stay up to date with the latest Roblox Jailbreak updates, patch notes, and changes. Track new features, bug fixes, and game improvements.',
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: 'Latest Updates & Patch Notes | Changelogs',
      description:
        'Stay up to date with the latest Roblox Jailbreak updates, patch notes, and changes. Track new features, bug fixes, and game improvements.',
      images: [
        {
          url: 'https://assets.jailbreakchangelogs.xyz/assets/logos/JBCL_Long_Dark_Background.webp',
          width: 1200,
          height: 630,
          alt: 'Jailbreak Changelogs Banner',
        },
      ],
      type: 'website',
      locale: 'en_US',
      siteName: 'Jailbreak Changelogs',
      url: 'https://jailbreakchangelogs.xyz',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Latest Updates & Patch Notes | Changelogs',
      description:
        'Stay up to date with the latest Roblox Jailbreak updates, patch notes, and changes. Track new features, bug fixes, and game improvements.',
      images: [
        'https://assets.jailbreakchangelogs.xyz/assets/logos/JBCL_Long_Dark_Background.webp',
      ],
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isMaintenanceMode } = await checkMaintenanceMode();

  if (isMaintenanceMode) {
    return (
      <html lang="en">
        <head>
          {/* Google Analytics */}
          <GoogleAnalytics gaId="G-729QSV9S7B" />
          {/* Google AdSense */}
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8152532464536367"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        </head>
        <body className={`${inter.className} bg-primary-bg`}>
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <MaintenanceBypass>
              <Toaster
                position="bottom-right"
                toastOptions={{
                  success: {
                    style: {
                      background: 'var(--color-button-success)',
                      color: 'var(--color-primary-text)',
                      border: '1px solid var(--color-button-success)',
                    },
                    iconTheme: {
                      primary: 'var(--color-primary-text)',
                      secondary: 'var(--color-button-success)',
                    },
                  },
                  error: {
                    style: {
                      background: 'var(--color-button-danger)',
                      color: 'var(--color-primary-text)',
                      border: '1px solid var(--color-button-danger)',
                    },
                    iconTheme: {
                      primary: 'var(--color-primary-text)',
                      secondary: 'var(--color-button-danger)',
                    },
                  },
                  loading: {
                    style: {
                      background: 'var(--color-button-info)',
                      color: 'var(--color-primary-text)',
                      border: '1px solid var(--color-button-info)',
                    },
                    iconTheme: {
                      primary: 'var(--color-primary-text)',
                      secondary: 'var(--color-button-info)',
                    },
                  },
                }}
              />
              <NextTopLoader
                color="var(--color-button-info)"
                initialPosition={0.08}
                crawlSpeed={200}
                height={3}
                crawl={true}
                showSpinner={false}
                easing="ease"
                speed={200}
                shadow="0 0 10px var(--color-button-info),0 0 5px var(--color-button-info)"
                zIndex={1600}
              />
              <OfflineDetector />
              <AuthCheck />
              <AuthProvider>
                <SurveyProvider>
                  <div className="flex min-h-screen flex-col">
                    <Suspense
                      fallback={
                        <div className="border-secondary-text bg-secondary-bg h-16 border-b" />
                      }
                    >
                      <Header />
                    </Suspense>
                    <NewsTicker />
                    <main className="flex-1">{children}</main>
                    <Footer />
                  </div>
                </SurveyProvider>
              </AuthProvider>
            </MaintenanceBypass>
          </AppRouterCacheProvider>
          <Script id="clarity-script" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_PROJECT}");
            `}
          </Script>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <GoogleAnalytics gaId="G-729QSV9S7B" />
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8152532464536367"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${inter.className} bg-primary-bg`}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <Toaster
            position="bottom-right"
            toastOptions={{
              success: {
                style: {
                  background: 'var(--color-button-success)',
                  color: 'var(--color-primary-text)',
                  border: '1px solid var(--color-button-success)',
                },
                iconTheme: {
                  primary: 'var(--color-primary-text)',
                  secondary: 'var(--color-button-success)',
                },
              },
              error: {
                style: {
                  background: 'var(--color-button-danger)',
                  color: 'var(--color-primary-text)',
                  border: '1px solid var(--color-button-danger)',
                },
                iconTheme: {
                  primary: 'var(--color-primary-text)',
                  secondary: 'var(--color-button-danger)',
                },
              },
              loading: {
                style: {
                  background: 'var(--color-button-info)',
                  color: 'var(--color-primary-text)',
                  border: '1px solid var(--color-button-info)',
                },
                iconTheme: {
                  primary: 'var(--color-primary-text)',
                  secondary: 'var(--color-button-info)',
                },
              },
            }}
          />
          <NextTopLoader
            color="var(--color-button-info)"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px var(--color-button-info),0 0 5px var(--color-button-info)"
            zIndex={1600}
          />
          <OfflineDetector />
          <AuthCheck />
          <AuthProvider>
            <SurveyProvider>
              <div className="flex min-h-screen flex-col">
                <Suspense
                  fallback={<div className="border-secondary-text bg-secondary-bg h-16 border-b" />}
                >
                  <Header />
                </Suspense>
                <NewsTicker />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </SurveyProvider>
          </AuthProvider>
        </AppRouterCacheProvider>
        <Script id="clarity-script" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_PROJECT}");
          `}
        </Script>
      </body>
    </html>
  );
}
