import { useState, useEffect } from 'react'
import logo from './kioskAssets/university-of-peradeniya-logo-png_seeklogo-480462-removebg-preview.png'

interface NavigationTailwindProps {
  currentPage: number;
  onPageClick: (pageIndex: number) => void;
  pages: React.ComponentType[];
}

/**
 * Navigation Component - Tailwind Version
 * 
 * Sidebar navigation component with:
 * - University logo
 * - Navigation menu items
 * - Real-time date and time display
 * - Active page highlighting
 */
const NavigationTailwind: React.FC<NavigationTailwindProps> = ({ currentPage, onPageClick, pages }) => {
  // State for real-time clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  
  // Page names corresponding to the components
  const pageNames: string[] = ['Home', 'Events', 'Exhibits', 'Map', 'Heat Map']
  
  // Update time every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(timeInterval)
  }, [])
  
  return (
    <div className="fixed left-5 top-5 w-[180px] h-[calc(100vh-50px)] bg-slate-800/90 backdrop-blur-3xl border border-white/15 rounded-3xl p-4 flex flex-col z-[1000] shadow-[0_25px_50px_rgba(0,0,0,0.25)] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
      {/* Logo Section */}
      <div className="flex justify-center items-center mb-6 pb-6 border-b border-white/15">
        <img 
          src={logo} 
          alt="University of Peradeniya Logo" 
          className="w-[90px] h-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
        />
      </div>
      
      {/* Navigation Menu */}
      <div className="flex flex-col gap-4 flex-1 overflow-y-auto overflow-x-hidden px-2 pt-3 pb-0.5 scrollbar-thin scrollbar-thumb-blue-500/60 scrollbar-track-slate-700/30 hover:scrollbar-thumb-blue-500/80">
        {pages.map((_, index) => (
          <div
            key={index}
            className={`nav-item flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-700/60 backdrop-blur-md border-2 border-white/10 transition-all duration-300 ease-cubic-bezier(0.4,0,0.2,1) relative overflow-hidden cursor-pointer select-none ${
              index === currentPage 
                ? 'active bg-blue-500/30 border-blue-500/60 scale-105 shadow-[0_12px_35px_rgba(59,130,246,0.4)]' 
                : 'hover:bg-sky-400/20 hover:border-sky-400/40 hover:scale-105 hover:shadow-[0_8px_25px_rgba(56,189,248,0.3)]'
            }`}
            onClick={() => onPageClick(index)}
            style={{ cursor: 'pointer' }}
          >
            <span className="text-white/90 font-medium text-base">
              {pageNames[index]}
            </span>
          </div>
        ))}
      </div>
      
      {/* Date and Time Display */}
      <div className="mt-auto pt-4 border-t border-white/15 space-y-3">
        {/* Time Display */}
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-700/40 backdrop-blur-md rounded-xl border border-white/10">
          <span className="text-xl">🕐</span>
          <span className="text-white/90 font-medium text-base">
            {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        </div>
        
        {/* Date Display */}
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-700/40 backdrop-blur-md rounded-xl border border-white/10">
          <span className="text-xl">📅</span>
          <span className="text-white/90 font-medium text-base">
            {currentTime.toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Custom styles for webkit scrollbar */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .scrollbar-thin::-webkit-scrollbar {
            width: 6px;
          }
          .scrollbar-track-slate-700/30::-webkit-scrollbar-track {
            background: rgba(51, 65, 85, 0.3);
            border-radius: 10px;
          }
          .scrollbar-thumb-blue-500/60::-webkit-scrollbar-thumb {
            background: rgba(59, 130, 246, 0.6);
            border-radius: 10px;
            transition: background 0.3s ease;
          }
          .scrollbar-thumb-blue-500/60::-webkit-scrollbar-thumb:hover {
            background: rgba(59, 130, 246, 0.8);
          }
          .nav-item:hover { 
            background: rgba(56, 189, 248, 0.2); 
            border-color: rgba(56, 189, 248, 0.4); 
            transform: scale(1.02); 
            box-shadow: 0 10px 30px rgba(56, 189, 248, 0.3); 
          }
          .nav-item.active { 
            background: rgba(59, 130, 246, 0.3); 
            border-color: rgba(59, 130, 246, 0.6); 
            transform: scale(1.05); 
            box-shadow: 0 12px 35px rgba(59, 130, 246, 0.4); 
          }
        `
      }} />
    </div>
  )
}

export default NavigationTailwind
