/* =================================================================================
DỰ ÁN: TECH STORE MANAGER (SPRING BOOT + REACT + MYSQL)
PHIÊN BẢN: FINAL CONSOLIDATED
================================================================================= */

CREATE DATABASE IF NOT EXISTS TechStoreManager;
USE TechStoreManager;

/* =====================================================================
👤 NHÓM 1: QUẢN LÝ NGƯỜI DÙNG & PHÂN QUYỀN (RBAC)
===================================================================== */

-- 1. Bảng Vai trò
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,      -- Tên vai trò (admin, staff, user)
    description VARCHAR(255) NULL          -- Mô tả chi tiết vai trò
);


-- 3. Bảng Người dùng
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,        -- Tên đăng nhập
    email VARCHAR(100) UNIQUE NOT NULL,    -- Email (dùng để login/nhận tin)
    password VARCHAR(255) NULL,            -- Mật khẩu đã mã hóa (NULL nếu login FB/Google)
    provider ENUM('local','google','facebook') DEFAULT 'local', -- Nguồn đăng nhập
    provider_id VARCHAR(255) NULL,         -- ID từ Google/Facebook trả về
    avatar VARCHAR(500) NULL,              -- Link ảnh đại diện
    phone VARCHAR(20) NULL,                -- Số điện thoại liên hệ
    gender ENUM('male','female','other') NULL DEFAULT 'other', -- Giới tính
    date_of_birth DATE NULL,               -- Ngày sinh
    status ENUM('active','inactive','banned') DEFAULT 'active', -- Trạng thái tài khoản
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Bảng Trung gian: User - Role (Một user có nhiều role)
CREATE TABLE user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY(user_id, role_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 6. Bảng Mã đặt lại mật khẩu
CREATE TABLE password_reset_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    code VARCHAR(10) NOT NULL,             -- Mã OTP gửi qua email
    expired_at DATETIME NOT NULL,          -- Thời gian hết hạn mã
    attempts INT DEFAULT 0,                -- Số lần nhập sai (để chặn brute-force)
    used BOOLEAN DEFAULT FALSE,            -- Đã sử dụng hay chưa
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


/* =====================================================================
📱 NHÓM 2: SẢN PHẨM & DANH MỤC (TECH CATALOG)
===================================================================== */

-- 7. Bảng Thương hiệu
CREATE TABLE brands (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,            -- Tên hãng (Apple, Samsung...)
    slug VARCHAR(255) UNIQUE NOT NULL,     -- Đường dẫn SEO
    logo_url VARCHAR(255) NULL,            -- Link logo hãng
    description TEXT NULL,                 -- Mô tả về hãng
    status TINYINT DEFAULT 1,              -- 1: Hiện, 0: Ẩn
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL               -- Thời điểm xóa mềm (nếu có)
);

-- 8. Bảng Danh mục
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,            -- Tên danh mục (Laptop, Điện thoại...)
    slug VARCHAR(255) UNIQUE NOT NULL,     -- Đường dẫn SEO
    parent_id INT NULL,                    -- ID danh mục cha (đệ quy)
    description TEXT NULL,                 -- Mô tả danh mục
    image_url VARCHAR(255) NULL,           -- Ảnh đại diện danh mục
    status TINYINT DEFAULT 1,              -- 1: Hiện, 0: Ẩn
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 3. Bảng Sản phẩm Gốc (Product Master)
-- Nơi ĐỊNH NGHĨA tên các tùy chọn (Ví dụ: Option 1 là Màu, Option 2 là RAM)
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    brand_id INT NULL,
    category_id INT NULL,
    
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    warranty_period VARCHAR(100) NULL,      -- Ví dụ: "12 tháng chính hãng", "24 tháng tại Shop"
    description LONGTEXT NULL,              -- Bài viết chi tiết (HTML)

    thumbnail VARCHAR(255) NULL,            -- Ảnh đại diện chính

    option1_name VARCHAR(50) NULL,          -- Ví dụ: "Màu sắc"
    option2_name VARCHAR(50) NULL,          -- Ví dụ: "Dung lượng"
    option3_name VARCHAR(50) NULL,          -- Ví dụ: "Kích thước" (Tối đa 3 là đủ 99% trường hợp)
    
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY(brand_id) REFERENCES brands(id) ON DELETE SET NULL,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 4. Bảng Biến thể (Product Variants - SKU)
-- Nơi LƯU GIÁ TRỊ của các tùy chọn (Ví dụ: Đỏ, 128GB)
CREATE TABLE product_variants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    
    sku VARCHAR(100) UNIQUE NOT NULL,       -- Mã quản lý kho (bắt buộc)
    
    -- GIÁ TRỊ TÙY CHỌN (Mapping với bảng products)
    option1_value VARCHAR(50) NULL,         -- Ví dụ: "Đỏ"
    option2_value VARCHAR(50) NULL,         -- Ví dụ: "128GB"
    option3_value VARCHAR(50) NULL,         -- Ví dụ: "40mm"
    
    price DECIMAL(15,2) NOT NULL,           -- Giá bán của biến thể này
    original_price DECIMAL(15,2) NULL,      -- Giá gốc (để gạch ngang giảm giá)
    stock_quantity INT DEFAULT 0,           -- Tồn kho thực tế
    isDefault BOOLEAN DEFAULT false,
    is_serial_required BOOLEAN NOT NULL DEFAULT FALSE,
    
    weight DECIMAL(10,2) NULL,              -- Cân nặng (để tính ship)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE product_variant_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    variant_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0, -- thứ tự hiển thị
    is_thumbnail BOOLEAN DEFAULT FALSE, -- nếu muốn đánh dấu ảnh chính của màu
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

-- 6. Bảng Định nghĩa Thông số kỹ thuật (Specs Definition)
-- Dùng để hiển thị bảng cấu hình (Chip, Pin, Màn hình...)
CREATE TABLE attributes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,             -- Ví dụ: "Hệ điều hành", "Chipset", "Dung lượng Pin"
    code VARCHAR(50) NULL,                  -- Ví dụ: "os", "chipset", "battery" (dùng cho dev)
    filter_group VARCHAR(50) NULL           -- Nhóm bộ lọc (Ví dụ: "Cấu hình")
);

-- 7. Bảng Giá trị Thông số kỹ thuật (Specs Values)
CREATE TABLE product_attribute_values (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    attribute_id INT NOT NULL,
    value VARCHAR(255) NOT NULL,            -- Ví dụ: "iOS 17", "A17 Pro", "4422 mAh"
    
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY(attribute_id) REFERENCES attributes(id) ON DELETE CASCADE
);

/* =====================================================================
🛒 NHÓM 3: ĐƠN HÀNG & THANH TOÁN (SALES & ORDERS)
===================================================================== */

-- 14. Bảng Giỏ hàng
CREATE TABLE carts (
     id INT PRIMARY KEY AUTO_INCREMENT,
     session_id VARCHAR(100) UNIQUE NULL,   -- Dùng cho khách vãng lai (Lưu UUID trên Cookie/LocalStorage)
     user_id INT UNIQUE NULL,               -- Dùng cho khách đã đăng nhập (UNIQUE để 1 user chỉ có 1 giỏ hàng)
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Ràng buộc: Bắt buộc phải có session_id HOẶC user_id (không được phép trống cả 2)
     CONSTRAINT chk_cart_owner CHECK (session_id IS NOT NULL OR user_id IS NOT NULL),
     FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 15. Bảng Chi tiết giỏ hàng (Của bạn thiết kế rất chuẩn rồi, tôi chỉ thêm index để truy vấn nhanh hơn)
CREATE TABLE cart_items (
     id INT PRIMARY KEY AUTO_INCREMENT,
     cart_id INT NOT NULL,
     product_variant_id INT NOT NULL,
     quantity INT DEFAULT 1,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

     FOREIGN KEY(cart_id) REFERENCES carts(id) ON DELETE CASCADE,
     FOREIGN KEY(product_variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,

    -- Đảm bảo 1 sản phẩm không bị lặp lại thành 2 dòng trong cùng 1 giỏ hàng (Nếu thêm thì cộng dồn quantity)
     UNIQUE KEY unique_cart_variant (cart_id, product_variant_id)
);

-- 16. Bảng Mã giảm giá
CREATE TABLE vouchers (
                          id INT PRIMARY KEY AUTO_INCREMENT,
                          name VARCHAR(150) NOT NULL,            -- Tên chương trình khuyến mãi
                          code VARCHAR(50) UNIQUE NOT NULL,      -- Mã nhập vào (SALE50)
                          discount_type ENUM('percent', 'fixed') NOT NULL, -- Giảm theo % hay tiền mặt
                          discount_value DECIMAL(15,2) NULL,
                          max_discount_value DECIMAL(15,2) NULL, -- VD: Giảm 50% nhưng tối đa 500,000đ
                          min_order_value DECIMAL(15,2) DEFAULT 0, -- Đơn tối thiểu để áp dụng
                          start_date DATETIME NOT NULL,          -- Ngày bắt đầu
                          end_date DATETIME NOT NULL,            -- Ngày kết thúc
                          usage_limit INT DEFAULT 0,             -- Tổng số lần mã có thể dùng
                          used_count INT DEFAULT 0,              -- Số lần đã dùng
                          deleted_at DATETIME NULL,              -- Xóa mềm
                          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                          updated_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE flash_sales (
                             id INT PRIMARY KEY AUTO_INCREMENT,
                             product_variant_id INT NOT NULL,
                             flash_sale_price DECIMAL(15,2) NOT NULL,
                             start_time DATETIME NOT NULL,
                             end_time DATETIME NOT NULL,

    -- QUẢN LÝ TỔNG KHO SALE (TIKTOK STYLE)
                             sale_stock_quantity INT NOT NULL, -- Ví dụ: 200 (Tổng suất)
                             sold_quantity INT DEFAULT 0,      -- Ví dụ: Đã bán 199
                             max_quantity_per_user INT DEFAULT 1, -- Mỗi người chỉ được mua 1 cái giá Flash Sale

                             status TINYINT DEFAULT 1,
                             FOREIGN KEY (product_variant_id) REFERENCES product_variants(id)
);

-- 17. Bảng Địa chỉ giao hàng (Sổ địa chỉ của User đăng nhập)
CREATE TABLE addresses (
                           id INT PRIMARY KEY AUTO_INCREMENT,
                           user_id INT NOT NULL,                  -- [SỬA] Đã là sổ địa chỉ thì phải thuộc về 1 User
                           full_name VARCHAR(100) NOT NULL,       -- Tên người nhận
                           phone VARCHAR(20) NOT NULL,            -- SĐT người nhận
                           address_detail VARCHAR(255) NOT NULL,  -- Số nhà, tên đường
                           city VARCHAR(100) NOT NULL,            -- Tỉnh/Thành phố
                           district VARCHAR(100) NOT NULL,        -- Quận/Huyện
                           ward VARCHAR(100) NOT NULL,            -- Phường/Xã

                           city_code VARCHAR(20) NULL,            -- Mã code tỉnh (API ship)
                           district_code VARCHAR(20) NULL,        -- Mã code huyện (API ship)
                           ward_code VARCHAR(20) NULL,            -- Mã code xã (API ship)

                           is_default BOOLEAN DEFAULT FALSE,
                           created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                           FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 18. Bảng Đơn hàng
CREATE TABLE orders (
                        id INT PRIMARY KEY AUTO_INCREMENT,
                        code VARCHAR(50) UNIQUE NOT NULL,
                        user_id INT NULL,
                        voucher_id INT NULL,

    -- THÔNG TIN GIAO HÀNG (Snapshot lưu cứng cho cả Guest và User)
                        customer_name VARCHAR(100) NOT NULL,
                        customer_phone VARCHAR(20) NOT NULL,
                        customer_email VARCHAR(150) NULL,
                        shipping_address VARCHAR(255) NOT NULL,
                        shipping_ward VARCHAR(100) NOT NULL,
                        shipping_district VARCHAR(100) NOT NULL,
                        shipping_city VARCHAR(100) NOT NULL,

    -- [BỔ SUNG] MÃ CODE ĐỊA CHỈ ĐỂ GỌI API VẬN CHUYỂN NGAY TỪ ĐƠN HÀNG
                        shipping_ward_code VARCHAR(20) NULL,
                        shipping_district_code VARCHAR(20) NULL,
                        shipping_city_code VARCHAR(20) NULL,

    -- THÔNG TIN XUẤT HÓA ĐƠN VAT
                        is_vat_required BOOLEAN DEFAULT FALSE,
                        company_name VARCHAR(255) NULL,
                        tax_code VARCHAR(50) NULL,
                        company_address VARCHAR(255) NULL,

                        total_amount DECIMAL(15,2) NOT NULL,
                        discount_amount DECIMAL(15,2) DEFAULT 0.0,
                        shipping_fee DECIMAL(15,2) DEFAULT 0.0,
                        final_amount DECIMAL(15,2) NOT NULL,

                        goship_shipment_id VARCHAR(50) NULL,
                        shipping_carrier VARCHAR(50) NULL,
                        tracking_number VARCHAR(50) NULL,

                        order_status ENUM('PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED', 'RETURNED') DEFAULT 'PENDING',
                        shipping_status VARCHAR(50) NULL,
                        shipment_status_txt VARCHAR(255) NULL,

                        cancel_reason VARCHAR(255) NULL,
                        note TEXT NULL,

                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
                        FOREIGN KEY(voucher_id) REFERENCES vouchers(id)
);
-- 19. Bảng Chi tiết Đơn hàng (Lưu snapshot)
CREATE TABLE order_items (
                             id INT PRIMARY KEY AUTO_INCREMENT,
                             order_id INT NOT NULL,
                             product_variant_id INT NULL,           -- ID biến thể

    -- 1. Snapshot thông tin cơ bản
                             product_name VARCHAR(255) NOT NULL,
                             sku VARCHAR(100) NULL,
                             thumbnail VARCHAR(255) NULL,

    -- 2. Snapshot cấu hình
                             option1_name VARCHAR(50) NULL,
                             option1_value VARCHAR(50) NULL,
                             option2_name VARCHAR(50) NULL,
                             option2_value VARCHAR(50) NULL,
                             option3_name VARCHAR(50) NULL,
                             option3_value VARCHAR(50) NULL,

    -- 3. Thông tin tài chính
                             quantity INT NOT NULL,
                             price DECIMAL(15,2) NOT NULL,
                             total_price DECIMAL(15,2) NOT NULL,
                             is_serial_required BOOLEAN,

                             FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
                             FOREIGN KEY(product_variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
);

-- 20. Bảng Thanh toán
CREATE TABLE payments (
                          id INT PRIMARY KEY AUTO_INCREMENT,
                          order_id INT NOT NULL,
                          method ENUM('COD','VNPAY','MOMO','BANK') NOT NULL,
                          amount DECIMAL(15,2) NOT NULL,
                          status ENUM('pending','completed','failed','refunded') DEFAULT 'pending',
                          transaction_code VARCHAR(100) NULL,
                          provider_response TEXT NULL,
                          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                          FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
);

/* =====================================================================
📦 NHÓM 4: QUẢN LÝ KHO & IMEI (INVENTORY MANAGEMENT)
===================================================================== */

-- 21. Bảng Phiếu kho (Nhập/Xuất/Kiểm kê)
CREATE TABLE inventory_notes (
                                 id INT PRIMARY KEY AUTO_INCREMENT,
                                 code VARCHAR(50) NOT NULL UNIQUE,
                                 type ENUM('IMPORT','EXPORT','ADJUST') NOT NULL,
                                 reason VARCHAR(50) NOT NULL,
                                 user_id INT NULL,
                                 supplier_name VARCHAR(255) NULL,
                                 total_amount DECIMAL(15,2) DEFAULT 0,
                                 note TEXT NULL,
                                 status ENUM('PENDING', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
                                 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                 FOREIGN KEY(user_id) REFERENCES users(id)
);

-- 22. Bảng Chi tiết Phiếu kho
CREATE TABLE inventory_note_details (
                                        id INT PRIMARY KEY AUTO_INCREMENT,
                                        inventory_note_id INT NOT NULL,
                                        product_variant_id INT NOT NULL,
                                        quantity INT NOT NULL,
                                        price DECIMAL(15,2) DEFAULT 0,
                                        FOREIGN KEY(inventory_note_id) REFERENCES inventory_notes(id) ON DELETE CASCADE,
                                        FOREIGN KEY(product_variant_id) REFERENCES product_variants(id)
);

-- 23. Bảng Lịch sử tồn kho (Audit Log)
CREATE TABLE inventory_history (
                                   id INT PRIMARY KEY AUTO_INCREMENT,
                                   product_variant_id INT NOT NULL,
                                   previous_quantity INT NOT NULL,
                                   change_amount INT NOT NULL,
                                   new_quantity INT NOT NULL,
                                   reference_type ENUM('INVENTORY_NOTE', 'ORDER', 'RETURN') NOT NULL,
                                   reference_id INT NOT NULL,
                                   note VARCHAR(255) NULL,
                                   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                   FOREIGN KEY(product_variant_id) REFERENCES product_variants(id)
);

-- 24. Bảng Serial/IMEI (Quản lý bảo hành)
CREATE TABLE product_serials (
                                 id INT PRIMARY KEY AUTO_INCREMENT,
                                 product_variant_id INT NOT NULL,
                                 serial_number VARCHAR(100) UNIQUE NOT NULL,
                                 status ENUM('AVAILABLE', 'SOLD', 'DEFECTIVE', 'RETURNED') DEFAULT 'AVAILABLE',
                                 inventory_note_id INT NULL,
                                 order_id INT NULL,
                                 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                 updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                 FOREIGN KEY(product_variant_id) REFERENCES product_variants(id),
                                 FOREIGN KEY(inventory_note_id) REFERENCES inventory_notes(id),
                                 FOREIGN KEY(order_id) REFERENCES orders(id)
);

/* =====================================================================
⭐ NHÓM 5: ĐÁNH GIÁ & HỖ TRỢ (REVIEWS & SUPPORT)
===================================================================== */

-- 25. Bảng Đánh giá sản phẩm
CREATE TABLE reviews (
                         id INT PRIMARY KEY AUTO_INCREMENT,

                         order_item_id INT NOT NULL, -- 🔥 cốt lõi
                         user_id INT NOT NULL,

                         product_id INT NOT NULL,   -- để query nhanh
                         variant_id INT NULL,       -- để biết biến thể

                         rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
                         comment TEXT NULL,

                         is_verified_purchase BOOLEAN DEFAULT TRUE,

                         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                         updated_at DATETIME NULL,

                         UNIQUE (order_item_id), -- 🔥 mỗi item chỉ review 1 lần

                         FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
);

CREATE TABLE review_images (
                               id INT PRIMARY KEY AUTO_INCREMENT,
                               review_id INT NOT NULL,
                               image_url VARCHAR(500),
                               FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);

-- 26. Bảng Vé hỗ trợ (Ticket)
CREATE TABLE support_tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,                      -- ID khách hàng (nếu đã login)
    email VARCHAR(100) NULL,               -- Email khách (nếu chưa login)
    order_id INT NULL,                     -- Đơn hàng liên quan (nếu có)
    subject VARCHAR(255) NOT NULL,         -- Tiêu đề vấn đề
    status ENUM('open', 'processing', 'resolved', 'closed') DEFAULT 'open', -- Trạng thái xử lý
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- 27. Bảng Nội dung chat hỗ trợ
CREATE TABLE support_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT NOT NULL,
    sender_id INT NULL,                    -- ID người gửi
    sender_type ENUM('user', 'admin', 'staff_customer_support') NOT NULL, -- Loại người gửi
    message TEXT NULL,                     -- Nội dung tin nhắn
    attachment_url VARCHAR(500) NULL,      -- File đính kèm
    attachment_type VARCHAR(50) NULL,      -- Loại file
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE SET NULL
);


/* =====================================================================
🤖 NHÓM 6: AI CHAT (CHATBOT LOGS)
===================================================================== */

-- 1. Bảng Phiên Chat (Quản lý ngữ cảnh)
CREATE TABLE chat_sessions (
                               id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               user_id INTEGER, -- Link tới bảng Users của bạn
                               session_key VARCHAR(255), -- Dùng cho Guest (Session ID từ Frontend)
                               title VARCHAR(255), -- Tiêu đề tự động (VD: Hỏi về iPhone 15)
                               context_type VARCHAR(50), -- PRODUCT, ORDER, SYSTEM, GENERAL
                               context_id INTEGER, -- ID của Sản phẩm hoặc Đơn hàng cụ thể
                               created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                               updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

                               CONSTRAINT fk_chat_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 2. Bảng Tin nhắn (Lưu nội dung hội thoại)
CREATE TABLE chat_messages (
                               id BIGSERIAL PRIMARY KEY,
                               session_id UUID NOT NULL,
                               role VARCHAR(20) NOT NULL, -- USER, ASSISTANT, SYSTEM
                               content TEXT NOT NULL,

    -- Lưu thông tin snapshot: Giá SP lúc đó, Trạng thái đơn lúc đó...
                               metadata JSONB DEFAULT '{}'::jsonb,

                               tokens_used INTEGER DEFAULT 0, -- Kiểm soát chi phí gọi API Gemini
                               created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

                               CONSTRAINT fk_msg_session FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- 3. Bảng Logs tri thức AI (Để tối ưu RAG - Truy xuất dữ liệu)
-- Bảng này lưu lại những gì hệ thống đã "ném" cho AI để nó trả lời câu đó
CREATE TABLE ai_knowledge_logs (
                                   id BIGSERIAL PRIMARY KEY,
                                   message_id BIGINT NOT NULL,
                                   source_data JSONB, -- Dữ liệu thực tế từ DB (Product, Order, User Profile)
                                   query_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

                                   CONSTRAINT fk_log_message FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE
);

-- =========================================================
-- INDEX TỐI ƯU HIỆU NĂNG
-- =========================================================

-- Tìm kiếm session theo User nhanh hơn
CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_key ON chat_sessions(session_key);

-- Lấy lịch sử chat theo session (Sắp xếp theo thời gian)
CREATE INDEX idx_chat_messages_session_time ON chat_messages(session_id, created_at);

-- Index cho JSONB (Nếu bạn muốn tìm kiếm tin nhắn dựa trên metadata)
CREATE INDEX idx_chat_messages_metadata ON chat_messages USING GIN (metadata);