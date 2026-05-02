import { useQuery } from '@tanstack/react-query';
import API from '@/api/API'; // Đường dẫn đến file config Axios của bạn

// Lấy danh sách bài viết (Có phân trang)
export const useGetArticles = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ['public-articles', page, size],
    queryFn: async () => {
      const { data } = await API.get(`/public/articles?page=${page}&size=${size}`);
      return data.data; 
    },
    keepPreviousData: true,
  });
};

// Lấy chi tiết bài viết theo Slug
export const useGetArticleDetail = (slug) => {
  return useQuery({
    queryKey: ['article-detail', slug],
    queryFn: async () => {
      const { data } = await API.get(`/public/articles/${slug}`);
      return data.data; // Trả về ArticleResponse
    },
    enabled: !!slug,
    staleTime: 0, 
    cacheTime: 0,
    refetchOnMount: 'always'
  });
};