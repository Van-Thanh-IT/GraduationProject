package com.example.backend.exception;


import com.example.backend.dto.response.APIResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    //  Bắt Exception do mình custom
    @ExceptionHandler(value = CustomException.class)
    public ResponseEntity<APIResponse<?>> handleCustomException(CustomException ex){
        ErrorCode errorCode = ex.getErrorCode();
        APIResponse<?> response = APIResponse.error(errorCode.getCode(), errorCode.getMessage());
        return  ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // Bắt RuntimeException
    @ExceptionHandler(value = RuntimeException.class)
    public ResponseEntity<APIResponse<?>> handleRuntimeException(RuntimeException ex){
        APIResponse response = APIResponse.error(400,ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // Bắt lỗi validate @Valid
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<APIResponse<?>> handleValidationException(MethodArgumentNotValidException ex) {
        String message = ex.getFieldError() != null ? ex.getFieldError().getDefaultMessage() : "Validation error";
        APIResponse<?> response = APIResponse.error(ErrorCode.INVALID_INPUT.getCode(), message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }


    // Bắt lỗi toàn hệ thống
    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<APIResponse<?>> handleGenericException(Exception ex){
        APIResponse<?> response = APIResponse.error(ErrorCode.INTERNAL_SERVER_ERROR.getCode(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

}
