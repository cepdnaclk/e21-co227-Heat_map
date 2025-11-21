import { useEffect, useRef } from "react";

export default function Modal({ open, onClose, children }) {
  const ref = useRef(null);
  
  useEffect(() => {
    if (!open) return;
    const onKey = e => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => { 
      document.removeEventListener("keydown", onKey); 
      document.body.style.overflow = ""; 
    };
  }, [open, onClose]);
  
  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center" 
      onClick={onClose} 
      role="dialog" 
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
      <div 
        ref={ref} 
        tabIndex={-1} 
        onClick={(e)=>e.stopPropagation()}
        className="relative w-[92%] max-w-3xl bg-white rounded-2xl shadow-2xl p-6"
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-full hover:bg-gray-100"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
