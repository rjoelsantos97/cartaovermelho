import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import "./db-init";
import "./scheduler-init";
import { generateHomePageMetadata } from '@/lib/seo';
import { generateOrganizationStructuredData, generateWebSiteStructuredData } from '@/lib/seo';
import { generateSiteNavigationStructuredData, generateCollectionPageStructuredData } from '@/lib/seo/navigation-structured-data';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  ...generateHomePageMetadata(),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Generate structured data for the site
  const organizationStructuredData = generateOrganizationStructuredData();
  const websiteStructuredData = generateWebSiteStructuredData();
  const navigationStructuredData = generateSiteNavigationStructuredData();
  const collectionPageStructuredData = generateCollectionPageStructuredData();
  
  return (
    <html lang="pt">
      <head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-3FQWJL0GJZ"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-3FQWJL0GJZ');
            `,
          }}
        />
        
        {/* Favicon compatibility for all browsers and devices */}
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="mask-icon" href="/favicon.svg" color="#dc2626" />
        <meta name="msapplication-TileColor" content="#dc2626" />
        <meta name="theme-color" content="#dc2626" />
        
        {/* Site verification and indexing hints */}
        <meta name="google-site-verification" content="your-google-verification-code" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        
        {/* Site structure hints */}
        <link rel="canonical" href="https://cartaovermelho.pt" />
        <link rel="alternate" type="application/rss+xml" title="Cartão Vermelho News RSS" href="/feed.xml" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationStructuredData)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(navigationStructuredData)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(collectionPageStructuredData)
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${oswald.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
