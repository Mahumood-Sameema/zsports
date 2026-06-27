// VenueGallery Component
import React, { useState } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const VenueGallery = ({ images = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="w-full aspect-video rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400 font-semibold border">
        No images available
      </div>
    );
  }

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Main hero display aspect-video */}
      <div 
        onClick={() => setLightboxOpen(true)}
        className="relative w-full aspect-video rounded-xl overflow-hidden shadow bg-neutral-900 border border-neutral-100 cursor-zoom-in group"
      >
        <img
          src={images[activeIndex]}
          alt={`Venue gallery ${activeIndex}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
        />
        
        {/* Expand overlay */}
        <div className="absolute inset-0 bg-neutral-900/10 group-hover:bg-neutral-900/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-200">
          <span className="p-3 bg-white/90 backdrop-blur rounded-full shadow-lg text-neutral-800">
            <Maximize2 size={18} />
          </span>
        </div>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
          {images.map((img, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`relative w-20 aspect-video rounded overflow-hidden shrink-0 border-2 transition-all ${
                  isActive ? 'border-primary scale-[1.02] shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox full screen Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 select-none">
            {/* Close button overlay */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 hover:bg-neutral-750 text-white shadow-lg focus:outline-none"
            >
              <X size={20} />
            </button>

            {/* Navigators overlay */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-4 p-3 rounded-full bg-neutral-800/80 hover:bg-neutral-800 text-white focus:outline-none shadow-lg"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 p-3 rounded-full bg-neutral-800/80 hover:bg-neutral-800 text-white focus:outline-none shadow-lg"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            {/* Lightbox image content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl max-h-[85vh] p-4 flex items-center justify-center"
            >
              <img
                src={images[activeIndex]}
                alt="Fullscreen Lightbox"
                className="max-w-full max-h-[80vh] rounded shadow-2xl object-contain border border-neutral-800"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VenueGallery;
