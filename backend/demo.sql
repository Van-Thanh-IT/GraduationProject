--- Hàm tìm kiếm sản phẩm ->  searchAndFilterProducts
-- 1. Tạo GIN Index cho tìm kiếm tên sản phẩm (Full-Text Search)
-- 'simple' dùng cho tìm kiếm không phân biệt dấu/ngôn ngữ cơ bản, hoặc dùng 'vietnamese' nếu có extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- 2. Đánh GIN Index cho cột name của bảng products sử dụng thuật toán Trigram
CREATE INDEX idx_products_name_trgm ON products USING GIN (name gin_trgm_ops);

-- 2. Index cho các bộ lọc chính
CREATE INDEX idx_products_status_deleted ON products (status, deleted_at);
CREATE INDEX idx_categories_slug ON categories (slug);
CREATE INDEX idx_brands_slug ON brands (slug);

-- 3. Index cho giá và sắp xếp
CREATE INDEX idx_variants_price ON product_variants (price);


-------------------------------------------------------------------------------------
-- Hàm tìm kiếm
-- 1. Index cho Full-Text Search (Cực kỳ quan trọng để bỏ ILIKE)
CREATE INDEX idx_products_ai_search_fts ON products USING GIN (to_tsvector('simple', name));

-- 2. Index cho các cột hay dùng để lọc
CREATE INDEX idx_products_status_deleted ON products (status, deleted_at);
CREATE INDEX idx_categories_name ON categories (name);
CREATE INDEX idx_brands_name ON brands (name);

-- 3. Index cho Variants để lấy giá nhanh
CREATE INDEX idx_variants_product_id_price ON product_variants (product_id, is_default, price) WHERE deleted_at IS NULL;

----------------------------------------------------------------------------------------
--- Hàm tra cứu bảo hàng searchWarranty
-- 1. Index cho Số điện thoại (Chỉ đánh Index các đơn đã hoàn thành)
CREATE INDEX idx_orders_phone_completed
    ON orders (customer_phone)
    WHERE order_status = 'COMPLETED';

-- 2. Index cho Mã đơn hàng
CREATE INDEX idx_orders_code_completed
    ON orders (code)
    WHERE order_status = 'COMPLETED';

-- 3. Index cho số IMEI / Serial Number
CREATE INDEX idx_serials_number
    ON product_serials (serial_number);

-------------------------------------------------------------------------------------------

-- Kích hoạt extension hỗ trợ tìm kiếm ILIKE siêu tốc (nếu chưa có)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Index cơ bản cho User và Status (Giúp load danh sách đơn cực nhanh)
CREATE INDEX idx_orders_user_status ON orders (user_id, order_status);

-- 2. Index cho khóa ngoại (Chống nghẽn khi View thực hiện JOIN)
CREATE INDEX idx_order_items_order_id ON order_items (order_id);
CREATE INDEX idx_payments_order_id ON payments (order_id);
CREATE INDEX idx_reviews_order_item_id ON reviews (order_item_id);

-- 3. Index Trigram cho mã đơn hàng (Tăng tốc ILIKE '%...%')
CREATE INDEX idx_orders_code_trgm ON orders USING gin (code gin_trgm_ops);

-- 4. Index Trigram cho tên sản phẩm trong bảng order_items
CREATE INDEX idx_order_items_name_trgm ON order_items USING gin (product_name gin_trgm_ops);


-------------------------------------------------------------------------------
--- lây đánh giá theo sản phẩm -> getApprovedReviewsByProductId
-- 1. Index chính để tìm kiếm Review theo Sản phẩm và Trạng thái (Cực kỳ quan trọng)
CREATE INDEX idx_reviews_product_status ON reviews (product_id, status);

-- 2. Index hỗ trợ JOIN (Tránh nghẽn khi View kết nối bảng)
CREATE INDEX idx_review_images_review_id ON review_images (review_id);
CREATE INDEX idx_reviews_user_id ON reviews (user_id);
CREATE INDEX idx_reviews_variant_id ON reviews (product_variant_id);