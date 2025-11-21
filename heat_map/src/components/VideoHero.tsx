import React, { useState } from 'react';
import { Play, Pause } from 'lucide-react';

interface VideoHeroProps {
  videoSrc?: string | null;
  posterImage?: string;
  title?: string;
  subtitle?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  className?: string;
}

const VideoHero: React.FC<VideoHeroProps> = ({ 
  videoSrc = null, 
  posterImage = '/images/university-poster.jpg', 
  title = 'Welcome to Our University',
  subtitle = 'Celebrating 75 Years of Excellence',
  autoPlay = true,
  showControls = true,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  const togglePlay = (): void => {
    if (videoRef) {
      if (isPlaying) {
        videoRef.pause();
      } else {
        videoRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoLoad = (): void => {
    if (autoPlay && videoRef) {
      videoRef.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className={`relative w-full h-screen overflow-hidden ${className}`}>
      <div className="relative w-full h-full">
        {videoSrc ? (
          <video
            ref={setVideoRef}
            className="w-full h-full object-cover"
            poster={posterImage}
            onLoadedData={handleVideoLoad}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            muted
            loop
          >
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${posterImage})`
            }}
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl px-5">
            <h1 className="text-6xl font-bold mb-4 drop-shadow-lg md:text-5xl sm:text-4xl">
              {title}
            </h1>
            <p className="text-2xl mb-8 drop-shadow-md md:text-xl sm:text-lg">
              {subtitle}
            </p>
            
            {videoSrc && showControls && (
              <button 
                onClick={togglePlay}
                className="bg-white/20 border-2 border-white rounded-full w-20 h-20 flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out text-white hover:bg-white/30 hover:scale-110"
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                {isPlaying ? <Pause size={30} /> : <Play size={30} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoHero;
