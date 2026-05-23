package com.example.backend.service;

import java.util.List;
import java.util.concurrent.CompletableFuture;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.dto.request.ReviewRequest;
import com.example.backend.dto.response.AwaitingReviewResponse;
import com.example.backend.dto.response.ReviewResponse;
import com.example.backend.dto.response.ReviewSummaryResponse;
import com.example.backend.entity.*;
import com.example.backend.enums.OrderStatus;
import com.example.backend.enums.ReviewStatus;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.ReviewMapper;
import com.example.backend.repository.OrderItemRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.ReviewRepository;
import com.example.backend.repository.projection.ReviewSummaryProjection;
import com.example.backend.utils.CloudinaryUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReviewMapper reviewMapper;
    private final CloudinaryUtil cloudinaryutil;

    private static final int MAX_IMAGE_COUNT = 5;
    private static final int MAX_IMAGE_SIZE = 5 * 1024 * 1024;

    @Transactional(readOnly = true)
    public List<AwaitingReviewResponse> getAwaitingReviews(Integer userId) {
        return orderItemRepository.findItemsAwaitingReview(userId).stream()
                .map(reviewMapper::toAwaitingReviewResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ReviewSummaryResponse getReviewSummary(Integer productId) {
        if (!productRepository.existsById(productId)) {
            throw new CustomException(ErrorCode.PRODUCT_NOT_FOUND);
        }
        ReviewSummaryProjection proj = reviewRepository.getReviewSummaryByProductId(productId);

        return reviewMapper.toSummaryResponse(proj);
    }

    @Transactional
    public ReviewResponse createReview(Integer userId, ReviewRequest request) {

        OrderItem orderItem = orderItemRepository
                .findById(request.getOrderItemId())
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_ITEM_NOT_FOUND));

        validateReviewEligibility(orderItem, userId);

        ProductVariant variant = orderItem.getProductVariant();
        Review review = Review.builder()
                .product(variant.getProduct())
                .productVariant(variant)
                .orderItem(orderItem)
                .user(orderItem.getOrder().getUser())
                .rating(request.getRating())
                .comment(request.getComment())
                .status(ReviewStatus.PENDING)
                .build();

        handleImageUpload(request.getImages(), review);

        return reviewMapper.toReviewResponse(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getProductReviews(Integer productId, Integer rating) {
        if (rating != null && (rating < 1 || rating > 5)) {
            throw new CustomException(ErrorCode.REVIEW_INVALID_RATING);
        }

        List<Review> reviews = (rating != null)
                ? reviewRepository.findByProductIdAndStatusAndRatingOrderByCreatedAtDesc(
                        productId, ReviewStatus.APPROVED, rating)
                : reviewRepository.findByProductIdAndStatusOrderByCreatedAtDesc(productId, ReviewStatus.APPROVED);

        return reviews.stream().map(reviewMapper::toReviewResponse).toList();
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getAllReviewsForAdmin(
            Integer productId, Integer rating, ReviewStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return reviewRepository
                .findAllForAdmin(productId, rating, status, pageable)
                .map(reviewMapper::toReviewResponse);
    }

    @Transactional
    public ReviewResponse updateReviewStatus(Integer reviewId, ReviewStatus newStatus) {
        Review review = getReviewOrThrow(reviewId);
        review.setStatus(newStatus);
        return reviewMapper.toReviewResponse(reviewRepository.save(review));
    }

    @Transactional
    public void deleteReviewByAdmin(Integer reviewId) {
        Review review = getReviewOrThrow(reviewId);

        List<String> imageUrlsToDelete =
                review.getImages().stream().map(ReviewImage::getImageUrl).toList();

        reviewRepository.delete(review);
        log.info("Admin đã xóa cứng đánh giá ID: {}", reviewId);

        CompletableFuture.runAsync(() -> deleteImagesFromCloudinary(imageUrlsToDelete));
    }

    private Review getReviewOrThrow(Integer reviewId) {
        return reviewRepository.findById(reviewId).orElseThrow(() -> new CustomException(ErrorCode.REVIEW_NOT_FOUND));
    }

    private void validateReviewEligibility(OrderItem orderItem, Integer userId) {
        Order order = orderItem.getOrder();
        if (!order.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.REVIEW_UNAUTHORIZED);
        }
        if (order.getOrderStatus() != OrderStatus.COMPLETED) {
            throw new CustomException(ErrorCode.REVIEW_ORDER_NOT_COMPLETED);
        }
        if (reviewRepository.existsByOrderItemId(orderItem.getId())) {
            throw new CustomException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }
    }

    private void handleImageUpload(List<MultipartFile> files, Review review) {
        if (files == null || files.isEmpty()) return;

        if (files.size() > MAX_IMAGE_COUNT) {
            throw new CustomException(ErrorCode.REVIEW_IMAGE_LIMIT_EXCEEDED);
        }

        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                String contentType = file.getContentType();
                if (contentType == null || !contentType.startsWith("image/")) {
                    throw new CustomException(ErrorCode.REVIEW_INVALID_FILE_TYPE);
                }
                if (file.getSize() > MAX_IMAGE_SIZE) {
                    throw new CustomException(ErrorCode.REVIEW_FILE_SIZE_EXCEEDED);
                }
            }
        }

        List<String> uploadedUrls = cloudinaryutil.uploadMultipleFiles(files);
        for (String url : uploadedUrls) {
            review.addImage(ReviewImage.builder().imageUrl(url).review(review).build());
        }
    }

    private void deleteImagesFromCloudinary(List<String> imageUrls) {
        for (String imageUrl : imageUrls) {
            if (imageUrl != null && !imageUrl.isEmpty()) {
                try {
                    boolean isDeleted = cloudinaryutil.deleteFile(imageUrl);
                    if (isDeleted) log.info("Đã dọn dẹp ảnh trên Cloudinary: {}", imageUrl);
                    else log.warn("Không thể xóa ảnh trên Cloudinary: {}", imageUrl);
                } catch (Exception e) {
                    log.error("Lỗi khi xóa ảnh trên Cloudinary: {}", imageUrl, e);
                }
            }
        }
    }
}
