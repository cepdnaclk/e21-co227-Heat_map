import React from 'react'

interface FooterTailwindProps {}

/**
 * Footer Component - Tailwind Version
 * 
 * Application footer with:
 * - Copyright information
 * - System branding
 * - University attribution
 */
const FooterTailwind: React.FC<FooterTailwindProps> = () => {
  return (
    <div className="mt-auto py-1 bg-black/10 border-t border-white/10">
      <div className="text-center text-white/80">
        <p className="my-1 text-xs font-normal">
          © 2025 Faculty of Engineering, University of Peradeniya
        </p>
        <p className="my-1 text-xs font-light">
          PeraVerse Digital Kiosk System by PeraCom
        </p>
      </div>
    </div>
  )
}

export default FooterTailwind
