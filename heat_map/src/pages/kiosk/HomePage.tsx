import EngexLogo from './kioskAssets/Engex.jpg'
import { useState, useEffect } from 'react'

// Faculty slideshow images + captions
import Img1 from './kioskAssets/background_image.jpg'
import Img2 from './kioskAssets/B-min-scaled.jpg'
import Img3 from './kioskAssets/Faculty75Lightened-scaled.jpeg'
import Img4 from './kioskAssets/FOEdroneView-scaled.jpg'

interface Slide {
  image: string;
  caption?: string;
}

interface HomePageTailwindProps {}

const HomePageTailwind: React.FC<HomePageTailwindProps> = () => {
  const slides: Slide[] = [
    { image: Img1 },
    { image: Img2 },
    { image: Img3 },
    { image: Img4 }
  ]

  const [currentIndex, setCurrentIndex] = useState<number>(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length)
    }, 4000) // 4s per slide
    return () => clearInterval(interval)
  }, [slides.length])

  return (
    <div className="h-screen w-full flex flex-col items-center overflow-hidden animate-fadeIn">
      {/* Fullscreen slideshow */}
      <div className="relative w-full h-screen overflow-hidden">
        <img
          src={slides[currentIndex].image}
          alt={`Slide ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Logo top-left */}
        <img 
          src={EngexLogo} 
          alt="EngEx Logo" 
          className="absolute top-5 left-5 h-20 w-auto rounded-lg bg-white/80 p-1.5" 
        />

        {/* Caption bottom-left */}
        <div className="absolute bottom-5 left-5 bg-black/60 px-5 py-2.5 rounded-lg text-white text-xl font-medium">
          {slides[currentIndex].caption}
        </div>

        {/* Right-aligned title for first slide */}
        {currentIndex === 0 && (
          <div className="absolute top-1/2 right-[5%] transform -translate-y-1/2 text-right text-white max-w-[500px] px-5 py-5 bg-black/60 rounded-2xl animate-slideInRight">
            <div className="text-4xl font-bold text-white leading-relaxed">
              Faculty of Engineering
            </div>
            <div className="text-2xl font-medium text-white">
              University of Peradeniya
            </div>
          </div>
        )}

        {/* Full-width description overlay */}
        <div className="absolute bottom-0 w-full px-12 py-8 bg-gradient-to-t from-black/80 to-black/30 text-white text-center backdrop-blur-sm shadow-[0_-4px_20px_rgba(0,0,0,0.5)] animate-fadeInUp">
          <p className="my-2 text-lg leading-relaxed text-shadow-lg">
            Sri Lanka's oldest and most prestigious engineering institution — shaping
            generations of innovators, leaders, and visionaries for over 75 years.
          </p>
          <p className="my-2 text-lg leading-relaxed text-shadow-lg">
            The <strong>Faculty of Engineering, University of Peradeniya</strong> proudly presents 
            <strong> EngEx2025</strong> – The Diamond Jubilee Exhibition. Discover groundbreaking 
            <strong> research, innovations</strong>, and <strong>future-shaping projects </strong> 
             as we mark this historic milestone in engineering education and impact.
          </p>
        </div>
      </div>

      {/* Custom styles for animations and text shadow */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideInRight {
            from { opacity: 0; transform: translate(50px, -50%); }
            to { opacity: 1; transform: translate(0, -50%); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
          .animate-slideInRight { animation: slideInRight 1.5s ease forwards; }
          .animate-fadeInUp { animation: fadeInUp 1.5s ease forwards; }
          .text-shadow-lg { text-shadow: 1px 1px 6px rgba(0,0,0,0.7); }
        `
      }} />
    </div>
  )
}

export default HomePageTailwind
