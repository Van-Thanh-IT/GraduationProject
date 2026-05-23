import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarOutlined, EyeOutlined, RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useGetArticles } from '@/hooks/useArticles';

export default function ArticleSection() {
  const navigate = useNavigate();
  const { data: pageData, isLoading } = useGetArticles(0, 4);
  const articles = pageData?.content || [];

  if (isLoading || articles.length === 0) return null;

  const featuredArticle = articles[0];
  const sideArticles = articles.slice(1, 4);

  return (
    <section className="bg-white font-sans">
      <div className="max-w-[1200px] mx-auto px-4">
        
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
          <h2 className="text-[17px] lg:text-lg font-bold text-gray-800 uppercase tracking-wide m-0">
            Tin tức công nghệ
          </h2>
          <Link 
            to="/articles" 
            className="group flex items-center gap-1 text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Xem tất cả <RightOutlined className="text-[10px] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-6">
            <div 
              className="group cursor-pointer"
              onClick={() => navigate(`/articles/${featuredArticle.slug}`)}
            >
              <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-gray-100">
                <img 
                  src={featuredArticle.thumbnailUrl} 
                  alt={featuredArticle.title} 
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
              </div>
              <div className="mt-3">
                <div className="flex items-center gap-3 text-[12px] font-medium text-gray-400 mb-2">
                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[11px] font-bold">Mới nhất</span>
                  <span className="flex items-center gap-1"><CalendarOutlined /> {dayjs(featuredArticle.createdAt).format('DD/MM/YYYY')}</span>
                  <span className="flex items-center gap-1"><EyeOutlined /> {featuredArticle.viewCount}</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                  {featuredArticle.title}
                </h3>
                <p className="text-[14px] text-gray-500 line-clamp-3 leading-relaxed">
                  {featuredArticle.shortDescription}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col gap-4">
            {sideArticles.map((article) => (
              <div 
                key={article.id} 
                className="group flex gap-4 cursor-pointer items-start"
                onClick={() => navigate(`/articles/${article.slug}`)}
              >
                <div className="shrink-0 w-28 md:w-36 aspect-[16/9] rounded-xl overflow-hidden border border-gray-100">
                  <img 
                    src={article.thumbnailUrl} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400 mb-1">
                    <span className="flex items-center gap-1"><CalendarOutlined /> {dayjs(article.createdAt).format('DD/MM/YYYY')}</span>
                  </div>
                  <h4 className="text-[14px] md:text-[15px] font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h4>
                  <p className="text-[12px] text-gray-400 line-clamp-2 leading-normal">
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