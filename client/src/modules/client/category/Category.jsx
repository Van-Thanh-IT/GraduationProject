import React from 'react';
import { mockCategories } from '@/data/mockCategories';
import CategoryItem from './CategoryItem';


const Category = () => {
    return (
       <div className="w-full max-w-[280px] bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Tiêu đề Sidebar */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
          Danh mục sản phẩm
        </h2>
      </div>

      {/* Danh sách */}
      <div className="flex flex-col py-2">
        {mockCategories.map((category) => (
          <CategoryItem key={category.id} category={category} />
        ))}
      </div>
    </div>
    );
}

export default Category;
