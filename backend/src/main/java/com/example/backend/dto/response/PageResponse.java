package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class PageResponse<T> {
    private List<T> items;          // Danh sách sản phẩm
    private int currentPage;        // Trang hiện tại
    private int totalPages;         // Tổng số trang
    private long totalElements;     // Tổng số sản phẩm tìm được
    private boolean hasNext;        // Còn trang tiếp theo không?
}