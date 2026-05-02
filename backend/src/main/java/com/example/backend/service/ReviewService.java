//package com.example.backend.service;
//
//import com.example.backend.dto.request.ReviewRequest;
//import com.example.backend.dto.response.ReviewResponse;
//import com.example.backend.entity.Product;
//import com.example.backend.entity.Review;
//import com.example.backend.entity.User;
//import com.example.backend.enums.OrderStatus;
//import com.example.backend.mapper.ReviewMapper;
//import com.example.backend.repository.OrderRepository;
//import com.example.backend.repository.ProductRepository;
//import com.example.backend.repository.ReviewRepository;
//import com.example.backend.utils.Cloudinaryutil;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.domain.Pageable;
//import org.springframework.data.domain.Sort;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Slf4j // Thêm log để tracking lỗi
//@Service
//@RequiredArgsConstructor
//public class ReviewService {
//
//    private final ReviewRepository reviewRepository;
//    private final ProductRepository productRepository;
//    private final OrderRepository orderRepository;
//    private final ReviewMapper reviewMapper;
//    private final Cloudinaryutil cloudinaryutil;
//
//    // ==========================================
//    // ADMIN: XEM DANH SÁCH TOÀN BỘ ĐÁNH GIÁ (CÓ PHÂN TRANG)
//    // ==========================================
//    public Page<ReviewResponse> getAllReviewsForAdmin(Integer productId, Integer rating, int page, int size) {
//        // Sắp xếp mới nhất lên đầu để Admin luôn thấy review nóng hổi nhất
//        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
//
//        Page<Review> reviewPage;
//
//        // Xử lý logic lọc đa điều kiện
//        if (productId != null && rating != null && rating > 0 && rating <= 5) {
//            reviewPage = reviewRepository.findByProductIdAndRating(productId, rating, pageable);
//        } else if (productId != null) {
//            reviewPage = reviewRepository.findByProductId(productId, pageable);
//        } else if (rating != null && rating > 0 && rating <= 5) {
//            reviewPage = reviewRepository.findByRating(rating, pageable);
//        } else {
//            reviewPage = reviewRepository.findAll(pageable);
//        }
//
//        return reviewPage.map(reviewMapper::toResponse);
//    }
//
//    // ==========================================
//    // KHÁCH HÀNG: THÊM ĐÁNH GIÁ MỚI
//    // ==========================================
//    @Transactional(rollbackFor = Exception.class)
//    public ReviewResponse createReview(Integer userId, ReviewRequest request) {
//
//        if (reviewRepository.existsByUserIdAndProductId(userId, request.getProductId())) {
//            throw new IllegalStateException("Bạn đã đánh giá sản phẩm này rồi! Mỗi sản phẩm chỉ được đánh giá 1 lần.");
//        }
//
//        Product product = productRepository.findById(request.getProductId())
//                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại hoặc đã bị xóa!"));
//
//        User user = new User();
//        user.setId(userId);
//
//        // Kiểm tra xem khách đã mua và đơn hàng đã giao thành công (COMPLETED / DELIVERED) chưa
//        boolean hasBought = orderRepository.existsByUserIdAndProductIdAndStatus(
//                userId,
//                product.getId(),
//                OrderStatus.COMPLETED
//        );
//
//
//        // 4. XỬ LÝ UPLOAD ẢNH CHẶT CHẼ
//        String imageUrl = null;
//        MultipartFile file = request.getImage();
//
//        if (file != null && !file.isEmpty()) {
//
//            // Bảo vệ 4.1: Kiểm tra định dạng (Chỉ cho phép file ảnh)
//            String contentType = file.getContentType();
//            if (contentType == null || !contentType.startsWith("image/")) {
//                throw new IllegalArgumentException("Lỗi định dạng: File tải lên bắt buộc phải là hình ảnh (JPG, PNG, JPEG...)");
//            }
//
//            long maxSizeInBytes = 5 * 1024 * 1024; // 5MB
//            if (file.getSize() > maxSizeInBytes) {
//                throw new IllegalArgumentException("Dung lượng vượt mức: Kích thước ảnh không được vượt quá 5MB");
//            }
//
//            try {
//                imageUrl = cloudinaryutil.saveFile(file);
//            } catch (Exception e) {
//                log.error("Lỗi upload ảnh Cloudinary cho User {}: {}", userId, e.getMessage());
//                throw new RuntimeException("Quá trình tải ảnh lên máy chủ thất bại, vui lòng thử lại sau!");
//            }
//        }
//
//        // 5. LƯU DATABASE
//        Review review = Review.builder()
//                .product(product)
//                .user(user)
//                .rating(request.getRating())
//                .comment(request.getComment())
//                .image(imageUrl) // Lưu link cloudinary
//                .isVerifiedPurchase(hasBought)
//                .build();
//
//        return reviewMapper.toResponse(reviewRepository.save(review));
//    }
//
//    // ==========================================
//    // PUBLIC: XEM DANH SÁCH ĐÁNH GIÁ (Có lọc sao)
//    // ==========================================
//    public List<ReviewResponse> getProductReviews(Integer productId, Integer rating) {
//        // Validation nhẹ: Bỏ qua nếu rating truyền linh tinh
//        if (rating != null && (rating < 1 || rating > 5)) {
//            throw new IllegalArgumentException("Số sao đánh giá phải từ 1 đến 5");
//        }
//
//        List<Review> reviews;
//        if (rating != null) {
//            reviews = reviewRepository.findByProductIdAndRatingOrderByCreatedAtDesc(productId, rating);
//        } else {
//            reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
//        }
//
//        return reviews.stream()
//                .map(reviewMapper::toResponse)
//                .collect(Collectors.toList());
//    }
//
//    // ==========================================
//    // ADMIN: XÓA BÌNH LUẬN (Soft Delete)
//    // ==========================================
//    @Transactional
//    public void deleteReviewByAdmin(Integer reviewId) {
//        Review review = reviewRepository.findById(reviewId)
//                .orElseThrow(() -> new IllegalArgumentException("Đánh giá không tồn tại hoặc đã bị xóa từ trước!"));
//
//        reviewRepository.delete(review);
//        log.info("Admin đã xóa mềm đánh giá ID: {}", reviewId);
//    }
//}

package com.example.backend.service;

import com.example.backend.dto.request.ReviewRequest;
import com.example.backend.dto.response.AwaitingReviewResponse;
import com.example.backend.dto.response.ReviewResponse;
import com.example.backend.dto.response.ReviewSummaryResponse;
import com.example.backend.entity.*;
import com.example.backend.enums.OrderStatus;
import com.example.backend.enums.ReviewStatus;
import com.example.backend.mapper.ReviewMapper;
import com.example.backend.repository.OrderItemRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.ReviewRepository;
import com.example.backend.repository.projection.ReviewSummaryProjection;
import com.example.backend.utils.Cloudinaryutil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository; // MỚI: Thêm repository này
    private final ReviewMapper reviewMapper;
    private final Cloudinaryutil cloudinaryutil;

    // ==========================================
    // KHÁCH HÀNG: THÊM ĐÁNH GIÁ MỚI
    // ==========================================
    @Transactional(rollbackFor = Exception.class)
    public ReviewResponse createReview(Integer userId, ReviewRequest request) {

        // 1. TÌM CHI TIẾT ĐƠN HÀNG
        OrderItem orderItem = orderItemRepository.findById(request.getOrderItemId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin sản phẩm trong đơn hàng!"));

        Order order = orderItem.getOrder();

        // 2. BẢO MẬT: Đúng người mua mới được đánh giá
        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Hành động bị từ chối! Bạn không có quyền đánh giá đơn hàng của người khác.");
        }

        // 3. KIỂM TRA TRẠNG THÁI ĐƠN HÀNG
        if (order.getOrderStatus() != OrderStatus.COMPLETED) {
            throw new IllegalStateException("Bạn chỉ có thể đánh giá sau khi đơn hàng đã hoàn thành!");
        }

        // 4. CHỐT SPAM: 1 dòng OrderItem chỉ được đánh giá 1 lần
        if (reviewRepository.existsByOrderItemId(orderItem.getId())) {
            throw new IllegalStateException("Bạn đã đánh giá sản phẩm này rồi! Mỗi sản phẩm trong đơn chỉ được đánh giá 1 lần.");
        }

        // 5. TẠO REVIEW GỐC (Chưa có ảnh)
        ProductVariant variant = orderItem.getProductVariant();
        Review review = Review.builder()
                .product(variant.getProduct())
                .productVariant(variant)
                .orderItem(orderItem)
                .user(order.getUser())
                .rating(request.getRating())
                .comment(request.getComment())
                .status(ReviewStatus.PENDING) // Mặc định chờ Admin duyệt
                .build();

        // 6. XỬ LÝ UPLOAD NHIỀU ẢNH
        List<MultipartFile> files = request.getImages();
        if (files != null && !files.isEmpty()) {

            if (files.size() > 5) {
                throw new IllegalArgumentException("Chỉ được phép tải lên tối đa 5 ảnh cho mỗi đánh giá!");
            }

            for (MultipartFile file : files) {
                if (file != null && !file.isEmpty()) {
                    String contentType = file.getContentType();
                    if (contentType == null || !contentType.startsWith("image/")) {
                        throw new IllegalArgumentException("File tải lên bắt buộc phải là hình ảnh!");
                    }

                    if (file.getSize() > 5 * 1024 * 1024) { // 5MB
                        throw new IllegalArgumentException("Kích thước mỗi ảnh không được vượt quá 5MB!");
                    }

                    try {
                        String imageUrl = cloudinaryutil.saveFile(file);
                        review.addImage(ReviewImage.builder().imageUrl(imageUrl).build());
                    } catch (Exception e) {
                        log.error("Lỗi upload ảnh Cloudinary: {}", e.getMessage());
                        throw new RuntimeException("Tải ảnh lên thất bại, vui lòng thử lại!");
                    }
                }
            }
        }

        return reviewMapper.toResponse(reviewRepository.save(review));
    }


    // ==========================================
    // PUBLIC: XEM DANH SÁCH ĐÁNH GIÁ (Chỉ lấy bài đã Duyệt)
    // ==========================================
    public List<ReviewResponse> getProductReviews(Integer productId, Integer rating) {
        if (rating != null && (rating < 1 || rating > 5)) {
            throw new IllegalArgumentException("Số sao đánh giá phải từ 1 đến 5");
        }

        List<Review> reviews;
        // Chú ý: Cần update ReviewRepository để tìm theo Status = APPROVED
        if (rating != null) {
            reviews = reviewRepository.findByProductIdAndStatusAndRatingOrderByCreatedAtDesc(
                    productId, ReviewStatus.APPROVED, rating);
        } else {
            reviews = reviewRepository.findByProductIdAndStatusOrderByCreatedAtDesc(
                    productId, ReviewStatus.APPROVED);
        }

        return reviews.stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }


    // ==========================================
    // ADMIN: XEM TOÀN BỘ ĐÁNH GIÁ (Cả PENDING, APPROVED, HIDDEN)
    // ==========================================
    public Page<ReviewResponse> getAllReviewsForAdmin(Integer productId, Integer rating, ReviewStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        // Lời khuyên: Chỗ này Admin lọc nhiều điều kiện, bạn nên viết 1 hàm @Query dùng COALESCE/IS NULL trong Repository
        // Tạm thời xử lý gọn bằng query method nếu các tham số đầy đủ
        Page<Review> reviewPage = reviewRepository.findAllForAdmin(productId, rating, status, pageable);

        return reviewPage.map(reviewMapper::toResponse);
    }


    // ==========================================
    // KHÁCH HÀNG: LẤY DANH SÁCH SẢN PHẨM CHỜ ĐÁNH GIÁ
    // ==========================================
    public List<AwaitingReviewResponse> getAwaitingReviews(Integer userId) {

        // 1. Gọi Repository để lấy những OrderItem thuộc đơn COMPLETED mà chưa có Review
        List<OrderItem> awaitingItems = orderItemRepository.findItemsAwaitingReview(userId);

        // 2. Map dữ liệu sang DTO để trả cho Frontend
        return awaitingItems.stream()
                .map(item -> {
                    // Xử lý chuỗi Option cho gọn (tránh null)
                    ProductVariant variant = item.getProductVariant();
                    String specs = variant.getOption1Value();
                    if (variant.getOption2Value() != null) specs += ", " + variant.getOption2Value();
                    if (variant.getOption3Value() != null) specs += ", " + variant.getOption3Value();

                    return AwaitingReviewResponse.builder()
                            .orderItemId(item.getId())
                            .productId(variant.getProduct().getId())
                            .productName(variant.getProduct().getName())
                            .thumbnail(variant.getProduct().getThumbnail())
                            .variantSpecs(specs)
                            .price(item.getPrice())
                            .quantity(item.getQuantity())
                            .orderDate(item.getOrder().getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ==========================================
    // PUBLIC: LẤY THỐNG KÊ TỔNG QUAN ĐÁNH GIÁ (Cho bảng ngang)
    // ==========================================
    public ReviewSummaryResponse getReviewSummary(Integer productId) {

        // Kiểm tra sản phẩm có tồn tại không (Tuỳ chọn)
        if (!productRepository.existsById(productId)) {
            throw new IllegalArgumentException("Sản phẩm không tồn tại");
        }

        ReviewSummaryProjection proj = reviewRepository.getReviewSummaryByProductId(productId);

        return ReviewSummaryResponse.builder()
                .averageRating(proj.getAverageRating())
                .totalReviews(proj.getTotalReviews())
                .fiveStar(proj.getFiveStar())
                .fourStar(proj.getFourStar())
                .threeStar(proj.getThreeStar())
                .twoStar(proj.getTwoStar())
                .oneStar(proj.getOneStar())
                .build();
    }


    // ==========================================
    // ADMIN: CẬP NHẬT TRẠNG THÁI KIỂM DUYỆT (MỚI)
    // ==========================================
    @Transactional
    public ReviewResponse updateReviewStatus(Integer reviewId, ReviewStatus newStatus) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Đánh giá không tồn tại!"));

        review.setStatus(newStatus);
        return reviewMapper.toResponse(reviewRepository.save(review));
    }

    // ==========================================
    // ADMIN: XÓA CỨNG BÌNH LUẬN & DỌN DẸP ẢNH SPAM
    // ==========================================
    @Transactional
    public void deleteReviewByAdmin(Integer reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Đánh giá không tồn tại!"));

        // 1. Trích xuất tất cả các link ảnh của đánh giá này ra một danh sách tạm
        List<String> imageUrlsToDelete = review.getImages().stream()
                .map(ReviewImage::getImageUrl)
                .toList();

        // 2. Xóa đánh giá khỏi Database (Do có CascadeType.ALL nên bảng review_images cũng tự bay màu)
        reviewRepository.delete(review);
        log.info("Admin đã xóa cứng đánh giá ID: {} khỏi Database", reviewId);

        // 3. Vòng lặp xóa từng ảnh trên Cloudinary
        for (String imageUrl : imageUrlsToDelete) {
            if (imageUrl != null && !imageUrl.isEmpty()) {
                boolean isDeleted = cloudinaryutil.deleteFile(imageUrl);
                if (isDeleted) {
                    log.info("Đã dọn dẹp ảnh rác trên Cloudinary: {}", imageUrl);
                } else {
                    log.warn("Không thể xóa ảnh trên Cloudinary: {}", imageUrl);
                }
            }
        }
    }
}