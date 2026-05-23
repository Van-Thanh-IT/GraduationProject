import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductService } from '@/services/product.service'; // Chỉnh lại đường dẫn nếu cần

// ==========================================
// 1. QUẢN LÝ QUERY KEYS (QUAN TRỌNG NHẤT)
// ==========================================
export const productKeys = {
  all: ['products'],
  lists: () => [...productKeys.all, 'list'],
  stats: (id) => [...productKeys.all, 'stats', id],
  
  // Thuộc tính
  attributes: (productId) => [...productKeys.all, 'attributes', productId],
  
  // Biến thể
  variants: (productId) => [...productKeys.all, 'variants', productId],
  searchVariants: (keyword) => [...productKeys.all, 'search', keyword],
};

// ==========================================
// 2. HOOKS CHO SẢN PHẨM (PRODUCTS)
// ==========================================
export const useGetAllProducts = () => {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: async () => {
      const res = await ProductService.getAllProducts();
      let data = res.data?.data || res.data || [];
      if (Array.isArray(data)) return [...data].sort((a, b) => b.id - a.id);
      return data;
    },
  });
};

export const useGetProductStats = (productId) => {
  return useQuery({
    queryKey: productKeys.stats(productId),
    queryFn: async () => {
      const res = await ProductService.getProductStatsById(productId);
      return res.data?.data || res.data;
    },
    enabled: !!productId, // Chỉ gọi khi có ID
  });
};

export const useSaveProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => 
      id ? ProductService.updateProduct(id, data) : ProductService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => ProductService.updateProductStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

// ==========================================
// 3. HOOKS CHO THUỘC TÍNH (ATTRIBUTES)
// ==========================================
export const useGetProductAttributes = (productId) => {
  return useQuery({
    queryKey: productKeys.attributes(productId),
    queryFn: async () => {
      const res = await ProductService.getAttributesByProductId(productId);
      return res.data?.data || res.data || [];
    },
    enabled: !!productId,
  });
};

export const useSaveProductAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // Nhận productId để biết chổ nào cần tải lại cache
    mutationFn: ({ productId, attributeId, data }) => 
      attributeId 
        ? ProductService.updateProductAttribute(attributeId, data) 
        : ProductService.addAttributeToProduct(productId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.attributes(variables.productId) });
    },
  });
};

export const useDeleteProductAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ attributeId }) => ProductService.deleteProductAttribute(attributeId),
    onSuccess: (_, variables) => {
      // Refresh lại danh sách thuộc tính của sản phẩm đó
      queryClient.invalidateQueries({ queryKey: productKeys.attributes(variables.productId) });
    },
  });
};

// ==========================================
// 4. HOOKS CHO BIẾN THỂ (VARIANTS)
// ==========================================
export const useGetProductVariants = (productId) => {
  return useQuery({
    queryKey: productKeys.variants(productId),
    queryFn: async () => {
      const res = await ProductService.getVariantsByProduct(productId);
      return res.data?.data || res.data || [];
    },
    enabled: !!productId,
  });
};

export const useSearchSimpleVariants = (keyword, limit = 20) => {
  return useQuery({
    queryKey: productKeys.searchVariants(keyword),
    queryFn: async () => {
      const res = await ProductService.searchSimpleVariants(keyword, limit);
      return res.data?.data || res.data || [];
    },
    enabled: false, 
  });
};

export const useSaveVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, variantId, data }) => 
      variantId 
        ? ProductService.updateVariant(variantId, data) 
        : ProductService.createVariant(productId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.variants(variables.productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.stats(variables.productId) }); // Update lại thống kê tồn kho
    },
  });
};

export const useDeleteVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ variantId }) => ProductService.softDeleteVariant(variantId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.variants(variables.productId) });
    },
  });
};

// ==========================================
// 5. HOOKS CHO HÌNH ẢNH (IMAGES)
// ==========================================
export const useUploadVariantImages = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ variantId, files }) => ProductService.uploadVariantImages(variantId, files),
    onSuccess: (_, variables) => {
      // Load lại variants để cập nhật ảnh mới
      queryClient.invalidateQueries({ queryKey: productKeys.variants(variables.productId) });
    },
  });
};

export const useManageVariantImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // action có thể là 'DELETE' hoặc 'SET_THUMBNAIL'
    mutationFn: ({ imageId, action }) => 
      action === 'DELETE' 
        ? ProductService.deleteVariantImage(imageId) 
        : ProductService.setThumbnail(imageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.variants(variables.productId) });
    },
  });
};

///////////////////////////////////////////////
//CLIENT
// Hook
export const useGetHomeProducts = (params) => {
  return useQuery({
    queryKey: ['shop-products', params],
    queryFn: async () => {
      const res = await ProductService.searchAndFilterProducts(params);
      return res.data?.data; // Trả về đúng object chứa items, totalPages...
    },
    // keepPreviousData giúp màn hình không bị chớp trắng khi chuyển trang
    keepPreviousData: true,
    staleTime: 3 * 60 * 1000, 
  });
};

export const useGetProductDetail = (slug) => {
  return useQuery({
    queryKey: [...productKeys.all, 'detail', slug],
    queryFn: async () => {
      const res = await ProductService.getProductBySlug(slug);

      return res.data?.data; 
    },
    // Rất quan trọng: Chỉ gọi API nếu slug có giá trị
    enabled: !!slug, 
    // Cache lại 5 phút, khách F5 hay bấm Back lại không bị chớp màn hình tải lại
    staleTime: 5 * 60 * 1000, 
  });
};