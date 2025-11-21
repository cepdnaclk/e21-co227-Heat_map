import { useEffect, useRef, useState } from 'react'
import introVideo from './kioskAssets/intro.mp4'
import peracomLogo from './kioskAssets/peracom.png'

interface IntroVideoTailwindProps {
  onVideoClick: () => void;
}

const IntroVideoTailwind: React.FC<IntroVideoTailwindProps> = ({ onVideoClick }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false)
  const [videoError, setVideoError] = useState<boolean>(false)

  useEffect(() => {
    // Auto-play the video when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log('Auto-play failed:', err)
      })
    }
  }, [])

  const handleClick = () => {
    if (onVideoClick) {
      onVideoClick()
    }
  }

  const handleVideoEnd = () => {
    // Restart video when it ends
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
    }
  }

  const handleVideoLoad = () => {
    setVideoLoaded(true)
  }

  const handleVideoError = () => {
    setVideoError(true)
    console.error('Failed to load intro video')
  }

  return (
    <div 
      className="fixed top-0 -bottom-12 left-0 w-screen h-screen bg-black flex items-center justify-center z-[9999] cursor-pointer overflow-hidden" 
      onClick={handleClick}
    >
      {videoError ? (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-900/80 via-emerald-800/90 to-emerald-700/80">
          <div className="text-center text-white p-10">
            <h1 className="text-6xl mb-4 font-serif drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
              🎬 PeraVerse
            </h1>
            <p className="text-2xl my-2 font-serif drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Faculty of Engineering
            </p>
            <p className="text-2xl my-2 font-serif drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              University of Peradeniya
            </p>
            <div className="flex flex-col items-center gap-2 mt-8">
              <span className="text-4xl animate-bounce"></span>
              <p className="text-xl -semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-bounce">
                Click To Continue
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="w-full h-full object-cover bg-black"
            src={introVideo}
            muted
            loop
            onEnded={handleVideoEnd}
            onLoadedData={handleVideoLoad}
            onError={handleVideoError}
            playsInline
          />
          {videoLoaded && (
            <>
              <div className="absolute top-8 left-8 flex flex-col items-center gap-3 bg-transparent/30 px-6 py-4 rounded-3xl backdrop-md ">
                <img src={peracomLogo} alt="PeraCom Logo" className="w-60 h-30" />
                <span className="text-white font-semibold text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center">
                  SMART INFO KIOSK
                </span>
              </div>
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center text-white z-[10000] bg-transparent/30 px-10 py-5 rounded-3xl backdrop-blur-md border border-white/20 animate-pulse">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl animate-bounce"></span>
                  <p className="m-0 text-2xl font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-serif animate-bounce">
                    Click To Continue
                  </p>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Custom animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
            60% {
              transform: translateY(-5px);
            }
          }
          @keyframes fadeInOut {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
          .animate-pulse {
            animation: fadeInOut 3s infinite;
          }
        `
      }} />
    </div>
  )
}

export default IntroVideoTailwind
