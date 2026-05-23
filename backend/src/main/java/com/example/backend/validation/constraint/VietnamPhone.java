package com.example.backend.validation.constraint;

import java.lang.annotation.*;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import com.example.backend.validation.validator.VietnamPhoneValidator;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = VietnamPhoneValidator.class)
@Documented
public @interface VietnamPhone {

    String message() default "Số điện thoại không hợp lệ";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
