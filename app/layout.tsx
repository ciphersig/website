import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { BASE_PATH } from "./constants/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CIPHER SIG | BY ANSH AND KUNAL",
  description: "CIPHER is a multidisciplinary creative production studio based in Yerevan, Armenia. We specialize in VFX, CGI, animation, commercial production, and sound design — merging high art with high tech.",
  keywords: [
    "CIPHER", "creative production studio", "VFX", "CGI", "animation", "commercial video production",
    "motion design", "Houdini", "Cinema 4D", "Unreal Engine", "Yerevan", "Armenia",
    "visual effects", "3D animation", "brand film", "sound design", "art direction",
  ],
  authors: [{ name: "CIPHER", url: "https://cipher.com" }],
  creator: "CIPHER",
  publisher: "CIPHER",
  icons: {
    icon: [{ url: `${BASE_PATH}/favicon.png`, type: 'image/png' }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cipher.com",
    siteName: "CIPHER",
    title: "CIPHER SIG | BY ANSH AND KUNAL",
    description: "A multidisciplinary creative production studio. VFX, CGI, animation, commercial production & sound design. Yerevan, Armenia.",
    images: [{ url: `${BASE_PATH}/loading-bg.jpg`, width: 1920, height: 1080, alt: "CIPHER Showreel" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CIPHER SIG | BY ANSH AND KUNAL",
    description: "A multidisciplinary creative production studio. VFX, CGI, animation, commercial production & sound design.",
    images: [`${BASE_PATH}/loading-bg.jpg`],
  },
  other: {
    'x-ua-compatible': 'IE=edge',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head suppressHydrationWarning>
        {/* JSON-LD structured data — used by Google for rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "name": "CIPHER",
            "description": "Multidisciplinary creative production studio specializing in VFX, CGI, animation, commercial production and sound design.",
            "url": "https://cipher.com",
            "logo": "https://cipher.com/favicon.png",
            "foundingDate": "2022",
            "slogan": "CIPHER SIG | BY ANSH AND KUNAL",
            "address": { "@type": "PostalAddress", "addressLocality": "Yerevan", "addressCountry": "AM" },
            "contactPoint": [
              { "@type": "ContactPoint", "telephone": "+1-424-3030572", "contactType": "customer service", "areaServed": "US" },
              { "@type": "ContactPoint", "telephone": "+374-99-499838", "contactType": "customer service", "areaServed": "AM" },
              { "@type": "ContactPoint", "email": "info@cipher.com", "contactType": "sales" }
            ],
            "sameAs": [
              "https://www.instagram.com/cipher_meswcoe26?utm_source=qr&igsi=MzA2aXlseHhyY3Vj",
              "https://www.linkedin.com/in/cipher-sig-238a3843a"
            ],
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Creative Production Services",
              "itemListElement": [
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "VFX & CGI", "description": "Visual effects, 3D animation, and CGI production using Houdini, Cinema 4D, and Unreal Engine." } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Commercial Production", "description": "Commercial video production and cinematic photoshoots." } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Creative & Sound Design", "description": "Concept development, graphic design, and audio sound design." } }
              ]
            }
          })}}
        />
        {/* Disable zoom on keyboard shortcuts */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0')) {
                  e.preventDefault();
                }
              }, false);
              document.addEventListener('wheel', (e) => {
                if ((e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                }
              }, { passive: false });
            `,
          }}
        />
        {/* UI icons (overlay) */}
        <link rel="preload" as="image" href={`${BASE_PATH}/back-arrow.svg`} type="image/svg+xml" />
        <link rel="preload" as="image" href={`${BASE_PATH}/instagram.svg`} type="image/svg+xml" />
        <link rel="preload" as="image" href={`${BASE_PATH}/linkedin.svg`} type="image/svg+xml" />
        <link rel="preload" as="image" href={`${BASE_PATH}/sound.svg`} type="image/svg+xml" />

        {/* Background audio */}
        <link
          rel="preload"
          as="audio"
          href={`${BASE_PATH}/Jesse Gillis - Time to Meditate - Soothing Eternal Synth Pads Soft High Bells.wav`}
          type="audio/wav"
          crossOrigin="anonymous"
        />

        {/* Navigation transition sounds */}
        <link
          rel="preload"
          as="audio"
          href={`${BASE_PATH}/audios/Forward.wav`}
          type="audio/wav"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="audio"
          href={`${BASE_PATH}/audios/Backward.wav`}
          type="audio/wav"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
