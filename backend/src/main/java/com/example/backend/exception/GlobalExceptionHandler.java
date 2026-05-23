package com.example.backend.exception;

import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.backend.dto.response.APIResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(value = CustomException.class)
    public ResponseEntity<APIResponse<?>> handleCustomException(CustomException ex) {
        ErrorCode errorCode = ex.getErrorCode();
        APIResponse<?> response = APIResponse.error(errorCode.getCode(), ex.getMessage());
        return ResponseEntity.status(errorCode.getHttpStatus()).body(response);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<APIResponse<?>> handleRuntimeException(RuntimeException ex) {
        APIResponse<?> response = APIResponse.error(ErrorCode.INTERNAL_SERVER_ERROR.getCode(), ex.getMessage());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<APIResponse<?>> handleValidationException(MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        fieldError -> fieldError.getField(),
                        fieldError -> fieldError.getDefaultMessage(),
                        (m1, m2) -> m1));

        APIResponse<?> response =
                APIResponse.error(ErrorCode.INVALID_INPUT.getCode(), "Validation failed", fieldErrors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<APIResponse<?>> handleGenericException(Exception ex) {

        log.error("Unhandled exception", ex);

        APIResponse<?> response = APIResponse.error(ErrorCode.INTERNAL_SERVER_ERROR.getCode(), ex.getMessage());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
