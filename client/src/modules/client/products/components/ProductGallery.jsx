// File: src/modules/client/products/detail/components/ProductGallery.jsx
import React, { useState, useEffect } from 'react';

export default function ProductGallery({ images = [] }) {
  const [activeImage, setActiveImage] = useState(null);

  // Mỗi khi mảng images thay đổi (do khách chọn Màu khác), tự tìm ảnh Thumbnail làm ảnh chính
  useEffect(() => {
    if (images && images.length > 0) {
      const thumb = images.find(img => img.isThumbnail) || images[0];
      setActiveImage(thumb.imageUrl);
    }
  }, [images]);

  if (!images.length) {
    return <div className="bg-slate-100 rounded-3xl aspect-square flex items-center justify-center text-slate-400 font-medium">Đang cập nhật hình ảnh</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ẢNH CHÍNH (TO) */}
      <div className="w-full aspect-square bg-white rounded-3xl border border-slate-100 p-6 flex items-center justify-center overflow-hidden shadow-sm relative group">
        <img 
          src={activeImage} 
          alt="Product" 
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {/* DẢI ẢNH PHỤ Ở DƯỚI */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => setActiveImage(img.imageUrl)}
              className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl border-2 p-1.5 overflow-hidden transition-all bg-white ${
                activeImage === img.imageUrl 
                  ? 'border-indigo-600 shadow-md shadow-indigo-100' 
                  : 'border-slate-100 hover:border-indigo-300'
              }`}
            >
              <img src={img.imageUrl} alt="Thumbnail" className="w-full h-full object-contain rounded-lg" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}