import React, { useState } from 'react';
import { Breadcrumb, Pagination, Spin } from 'antd';
import { HomeOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useGetArticles } from '@/hooks/useArticles';
import SEO from '@/components/SEO';
export default function ArticlePage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const size = 12; // Hiển thị 12 bài 1 trang

  const { data: pageData, isLoading } = useGetArticles(page, size);
  
  const articles = pageData?.content || [];
  const totalElements = pageData?.totalElements || 0;

  return (
    <>
      <SEO
        title="Tin tức"
        description="Cập nhật tin tức công nghệ mới nhất: điện thoại, laptop, AI, thủ thuật và đánh giá sản phẩm."
        url="/articles"
        type="website"
      />

      <div className="bg-gray-50 min-h-screen pb-16 pt-6 font-sans">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          
          <Breadcrumb className="mb-6" items={[
            { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
            { title: <span className="font-semibold text-gray-700">Tin tức & Công nghệ</span> }
          ]} />

          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h1 className="text-3xl font-black text-gray-800 mb-8 border-b border-gray-100 pb-4">Tất cả bài viết</h1>
            
            {isLoading ? (
              <div className="py-20 flex justify-center"><Spin size="large"/></div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {articles.map(article => (
                    <div key={article.id} className="group cursor-pointer flex flex-col h-full" onClick={() => navigate(`/articles/${article.slug}`)}>
                      <div className="aspect-video rounded-xl overflow-hidden mb-4 border border-gray-100">
                        <img src={article.thumbnailUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-center gap-3 text-xs font-medium text-gray-400 mb-2">
                          <span><CalendarOutlined /> {dayjs(article.createdAt).format('DD/MM/YYYY')}</span>
                          <span><EyeOutlined /> {article.viewCount} lượt xem</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">
                          {article.shortDescription}
                        </p>
                        <span className="text-sm font-bold text-indigo-600 group-hover:text-indigo-800 mt-auto">Đọc tiếp &rarr;</span>
                      </div>
                    </div>
                  ))}
                </div>

                {totalElements > 0 && (
                  <div className="mt-12 flex justify-center">
                    <Pagination 
                      current={page + 1} 
                      pageSize={size} 
                      total={totalElements} 
                      onChange={(p) => setPage(p - 1)} 
                      showSizeChanger={false}
                    />
                  </div>
                )}
              </>
            )}
          </div>

        </div>
        <div className='flex justify-center'>
        </div>
      </div>
    </> 
  );
}