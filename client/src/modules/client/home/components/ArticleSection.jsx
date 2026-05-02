import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarOutlined, EyeOutlined, RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useGetArticles } from '@/hooks/useArticles'; // Hook vừa tạo

export default function ArticleSection() {
  const navigate = useNavigate();
  // Lấy đúng 4 bài viết cho trang chủ
  const { data: pageData, isLoading } = useGetArticles(0, 4);
  const articles = pageData?.content || [];

  if (isLoading || articles.length === 0) return null;

  // Tách 1 bài đầu tiên làm nổi bật, 3 bài còn lại làm danh sách phụ
  const featuredArticle = articles[0];
  const sideArticles = articles.slice(1, 4);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
          <h2 className="text-2xl md:text-3xl font-black text-gray-800 uppercase tracking-tight">
            Tin Tức Công Nghệ
          </h2>
          <Link 
            to="/articles" 
            className="group flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Xem tất cả <RightOutlined className="text-[11px] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Layout: 1 To - 3 Nhỏ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CỘT TRÁI: Bài viết nổi bật (1 To) */}
          <div className="lg:col-span-7">
            <div 
              className="group cursor-pointer rounded-2xl overflow-hidden"
              onClick={() => navigate(`/articles/${featuredArticle.slug}`)}
            >
              <div className="relative aspect-video overflow-hidden rounded-2xl">
                <img 
                  src={featuredArticle.thumbnailUrl} 
                  alt={featuredArticle.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="mt-5">
                <div className="flex items-center gap-4 text-[13px] font-medium text-gray-500 mb-3">
                  <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md font-bold">Mới nhất</span>
                  <span className="flex items-center gap-1.5"><CalendarOutlined /> {dayjs(featuredArticle.createdAt).format('DD/MM/YYYY')}</span>
                  <span className="flex items-center gap-1.5"><EyeOutlined /> {featuredArticle.viewCount}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                  {featuredArticle.title}
                </h3>
                <p className="text-gray-600 line-clamp-3 leading-relaxed">
                  {featuredArticle.shortDescription}
                </p>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: 3 Bài viết nhỏ */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {sideArticles.map((article) => (
              <div 
                key={article.id} 
                className="group flex gap-4 cursor-pointer items-start"
                onClick={() => navigate(`/articles/${article.slug}`)}
              >
                <div className="shrink-0 w-32 md:w-40 aspect-video rounded-xl overflow-hidden">
                  <img 
                    src={article.thumbnailUrl} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 text-[12px] font-medium text-gray-400 mb-1.5">
                    <span className="flex items-center gap-1"><CalendarOutlined /> {dayjs(article.createdAt).format('DD/MM/YYYY')}</span>
                  </div>
                  <h4 className="text-[15px] md:text-base font-bold text-gray-800 mb-1.5 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h4>
                  <p className="text-[13px] text-gray-500 line-clamp-2">
                    {article.shortDescription}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}