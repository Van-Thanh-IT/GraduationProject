package com.example.backend.validation.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import com.example.backend.validation.constraint.VietnamPhone;

public class VietnamPhoneValidator implements ConstraintValidator<VietnamPhone, String> {

    private static final String PHONE_REGEX = "^(0)(3|5|7|8|9)[0-9]{8}$";

    @Override
    public boolean isValid(String phone, ConstraintValidatorContext context) {

        // ❗ Cho phép null → để @NotBlank xử lý riêng
        if (phone == null) return true;

        phone = phone.trim();

        // ❗ Nếu rỗng → để @NotBlank xử lý
        if (phone.isEmpty()) return true;

        return phone.matches(PHONE_REGEX);
    }
}
