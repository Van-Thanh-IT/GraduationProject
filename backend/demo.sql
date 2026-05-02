---Hàm tìm kiếm sản phẩm ->  searchAndFilterProducts
-- 1. Tạo GIN Index cho tìm kiếm tên sản phẩm (Full-Text Search)
-- 'simple' dùng cho tìm kiếm không phân biệt dấu/ngôn ngữ cơ bản, hoặc dùng 'vietnamese' nếu có extension
CREATE INDEX idx_products_name_fts ON products USING GIN (to_tsvector('simple', name));

-- 2. Index cho các bộ lọc chính
CREATE INDEX idx_products_status_deleted ON products (status, deleted_at);
CREATE INDEX idx_categories_slug ON categories (slug);
CREATE INDEX idx_brands_slug ON brands (slug);

-- 3. Index cho giá và sắp xếp
CREATE INDEX idx_variants_price ON product_variants (price);


-------------------------------------------------------------------------------------
-- 1. Index cho Full-Text Search (Cực kỳ quan trọng để bỏ ILIKE)
CREATE INDEX idx_products_ai_search_fts ON products USING GIN (to_tsvector('simple', name));

-- 2. Index cho các cột hay dùng để lọc
CREATE INDEX idx_products_status_deleted ON products (status, deleted_at);
CREATE INDEX idx_categories_name ON categories (name);
CREATE INDEX idx_brands_name ON brands (name);

-- 3. Index cho Variants để lấy giá nhanh
CREATE INDEX idx_variants_product_id_price ON product_variants (product_id, is_default, price) WHERE deleted_at IS NULL;

----------------------------------------------------------------------------------------