package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import com.example.backend.validation.constraint.VietnamPhone;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddressRequest {

    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 100, message = "Họ tên tối đa 100 ký tự")
    @Pattern(regexp = "^[^<>]*$", message = "Tên chứa ký tự không hợp lệ")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @VietnamPhone
    private String phone;

    @NotBlank(message = "Địa chỉ chi tiết không được để trống")
    @Size(max = 255, message = "Địa chỉ tối đa 255 ký tự")
    @Pattern(regexp = "^[^<>]*$", message = "Địa chỉ chứa ký tự không hợp lệ")
    private String addressDetail;

    @NotBlank(message = "Vui lòng chọn Tỉnh/Thành phố")
    private String city;

    @NotBlank(message = "Vui lòng chọn Quận/Huyện")
    private String district;

    @NotBlank(message = "Vui lòng chọn Phường/Xã")
    private String ward;

    @NotBlank(message = "Mã huyện không được để trống")
    @Pattern(regexp = "^\\d*$", message = "Mã tỉnh không hợp lệ")
    private String cityCode;

    @NotBlank(message = "Mã huyện không được để trống")
    @Pattern(regexp = "^\\d*$", message = "Mã huyện không hợp lệ")
    private String districtCode;

    @NotBlank(message = "Mã huyện không được để trống")
    @Pattern(regexp = "^\\d*$", message = "Mã xã không hợp lệ")
    private String wardCode;

    private Boolean isDefault;
}
