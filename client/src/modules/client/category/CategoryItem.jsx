import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

// --- COMPONENT ĐỆ QUY XỬ LÝ TỪNG ITEM ---
const CategoryItem = ({ category, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const hasChildren = category.children && category.children.length > 0;
  
  // Tính toán độ thụt lề dựa vào level (Cấp 0 không thụt, Cấp 1 thụt vào, Cấp 2 thụt sâu hơn)
  const paddingLeft = level === 0 ? 'pl-3' : `pl-${level * 6 + 3}`;

  return (
    <div className="flex flex-col">
      {/* NÚT BẤM CỦA DANH MỤC */}
      <div 
        onClick={() => hasChildren && setIsOpen(!isOpen)}
        className={`flex items-center justify-between py-2.5 pr-3 ${paddingLeft} cursor-pointer transition-colors duration-200 
          ${level === 0 ? 'hover:bg-blue-50/50' : 'hover:bg-gray-50'} 
          ${isOpen && level === 0 ? 'bg-blue-50/50' : ''}`}
      >
        <div className="flex items-center gap-3">
          {/* Chỉ hiển thị ảnh ở danh mục gốc (Level 0) để đỡ rối mắt */}
          {level === 0 && category.image && (
            <div className="w-8 h-8 rounded-full bg-gray-100 p-1.5 flex items-center justify-center flex-shrink-0">
              <img src={category.image} alt={category.name} className="w-full h-full object-contain opacity-70" />
            </div>
          )}
          
          {/* Tên danh mục */}
          <a 
            href={`/category/${category.slug}`} 
            onClick={(e) => hasChildren && e.preventDefault()} // Bỏ link nếu có menu con để ưu tiên việc mở menu
            className={`text-sm truncate ${level === 0 ? 'font-bold text-gray-800' : 'font-medium text-gray-600 hover:text-blue-600'}`}
          >
            {category.name}
          </a>
        </div>

        {/* Icon Mũi tên (Chỉ hiện khi có menu con) */}
        {hasChildren && (
          <div className="text-gray-400">
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
        )}
      </div>

      {/* RENDER MENU CON (Dùng CSS Grid để tạo hiệu ứng trượt mượt mà) */}
      {hasChildren && (
        <div 
          className={`grid transition-all duration-300 ease-in-out ${
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden flex flex-col">
            {category.children.map((child) => (
              <CategoryItem 
                key={child.id} 
                category={child} 
                level={level + 1} // Tăng cấp độ lên 1 để thụt lề ở lần lặp sau
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default CategoryItem;
