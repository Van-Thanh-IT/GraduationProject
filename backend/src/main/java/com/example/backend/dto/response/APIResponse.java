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
// dòng lệnh này giúp giảm key khi có giá trị null
@JsonInclude(JsonInclude.Include.NON_NULL)
public class APIResponse <T>{
    private int code;
    private String messages;

    private T data;

    // Factory method cho success
    public static <T> APIResponse<T> success(T data) {
        return new APIResponse<>(200, "Success", data);
    }

    // Factory method cho error
    public static <T> APIResponse<T> error(int code, String message) {
        return new APIResponse<>(code, message, null);
    }
}
