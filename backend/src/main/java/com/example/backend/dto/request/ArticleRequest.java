package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import org.springframework.web.multipart.MultipartFile;

import com.example.backend.enums.ArticleStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ArticleRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 255, message = "Tiêu đề không được quá 255 ký tự")
    private String title;

    @NotBlank(message = "Nội dung không được để trống")
    private String content;

    @Size(max = 500, message = "Mô tả ngắn không được quá 500 ký tự")
    private String shortDescription;

    private String authorName;

    @NotNull(message = "Trạng thái không được để trống")
    private ArticleStatus status;

    private MultipartFile thumbnail;
}
