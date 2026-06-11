package com.example.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class APIResponse<T> {

    private int code;
    private String messages;

    private T data;
    private Object errors;

    public static <T> APIResponse<T> success(T data) {
        return new APIResponse<>(200, "Success", data, null);
    }

    public static <T> APIResponse<T> error(int code, String message) {
        return new APIResponse<>(code, message, null, null);
    }

    public static <T> APIResponse<T> error(int code, String message, Object errors) {
        return new APIResponse<>(code, message, null, errors);
    }
}
