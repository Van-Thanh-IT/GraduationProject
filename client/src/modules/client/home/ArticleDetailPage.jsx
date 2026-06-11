import React from 'react';
import { Breadcrumb, Spin } from 'antd';
import { HomeOutlined, CalendarOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useGetArticleDetail } from '@/hooks/useArticles';
import SEO from '@/components/SEO';

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const { data: article, isLoading } = useGetArticleDetail(slug);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Spin size="large" /></div>;
  }

  if (!article) {
    return <div className="min-h-screen flex items-center justify-center text-xl font-bold text-gray-500 bg-gray-50">Không tìm thấy bài viết!</div>;
  }

  return (
    <>
      <SEO
        title={article.title}
        description={article.shortDescription}
        image={article?.thumbnailUrl}
        url={`/articles/${article.slug}`}
        type="article"
      />
      <div className="bg-gray-50 min-h-screen pb-16 pt-6 font-sans">
        <div className="max-w-[800px] mx-auto px-4 md:px-0">
          
          <Breadcrumb className="mb-6" items={[
            { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
            { title: <Link to="/articles">Tin tức</Link> },
            { title: <span className="text-gray-500 font-medium line-clamp-1 max-w-[200px] sm:max-w-none">{article.title}</span> }
          ]} />

          <article className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100">
            
            {/* Header Bài Viết */}
            <header className="mb-8 border-b border-gray-100 pb-6">
              <h1 className="text-3xl md:text-4xl font-black text-gray-800 leading-tight mb-4">
                {article.title}
              </h1>
              
              <p className="text-lg text-gray-600 font-medium italic mb-6 leading-relaxed">
                {article.shortDescription}
              </p>

              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm font-medium text-gray-500">
                <span className="flex items-center gap-1.5 font-bold text-gray-700 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                  <UserOutlined className="text-indigo-500" /> {article.authorName}
                </span>
                <span className="flex items-center gap-1.5"><CalendarOutlined /> {dayjs(article.createdAt).format('HH:mm - DD/MM/YYYY')}</span>
                <span className="flex items-center gap-1.5"><EyeOutlined /> {article.viewCount} lượt xem</span>
              </div>
            </header>

            {/* Thumbnail Chính */}
            <div className="mb-8 aspect-video rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <img src={article.thumbnailUrl} alt={article.title} className="w-full h-full object-cover" />
            </div>

            {/* Nội dung HTML (Render Content) */}
            <div 
              className="prose prose-lg prose-indigo max-w-none text-gray-800"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
            
          </article>

        </div>
      </div>
    </>
  );
}