// File: src/modules/client/products/detail/components/ProductGallery.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductGallery({ images = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images && images.length > 0) {
      const thumbIndex = images.findIndex(img => img.isThumbnail);
      setCurrentIndex(thumbIndex !== -1 ? thumbIndex : 0);
    }
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl aspect-square flex items-center justify-center text-gray-400 text-sm font-medium border border-gray-200">
        Đang cập nhật hình ảnh
      </div>
    );
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="flex flex-col gap-3 font-sans w-full">
      
      {/* ẢNH CHÍNH (Thu nhỏ gọn, tích hợp nút điều hướng) */}
      <div className="relative w-full aspect-square bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-center overflow-hidden group">
        <img 
          src={images[currentIndex]?.imageUrl} 
          alt="Product Main" 
          className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-102"
        />

        {/* NÚT MŨI TÊN ĐIỀU HƯỚNG TRÁI/PHẢI (Chỉ hiện khi có nhiều hơn 1 ảnh) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/5 hover:bg-black/15 text-gray-600 flex items-center justify-center transition-colors z-10"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/5 hover:bg-black/15 text-gray-600 flex items-center justify-center transition-colors z-10"
              aria-label="Next image"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </>
        )}
      </div>

      {/* DANH SÁCH ẢNH THUMBNAIL PHÍA DƯỚI */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar w-full">
          {images.map((img, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                key={img.id || index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-lg border p-1 overflow-hidden transition-colors bg-white flex items-center justify-center ${
                  isActive 
                    ? 'border-blue-600' 
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <img 
                  src={img.imageUrl} 
                  alt={`Thumbnail ${index + 1}`} 
                  className="max-w-full max-h-full object-contain rounded" 
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}