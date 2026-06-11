import { useQuery } from '@tanstack/react-query';
import ArticleService from '@/services/article.service';

export const useGetArticles = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ['public-articles', page, size],
    queryFn: async () => {
      const { data } = await ArticleService.getClientArticles(page, size);
      return data.data;
    },
    keepPreviousData: true,
  });
};

export const useGetArticleDetail = (slug) => {
  return useQuery({
    queryKey: ['article-detail', slug],
    queryFn: async () => {
      const { data } = await ArticleService.getClientArticleDetail(slug);
      return data.data;
    },
    enabled: !!slug,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: 'always',
  });
};