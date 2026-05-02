package com.example.backend.dto.request;

import com.example.backend.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.apache.commons.lang3.StringUtils;

import java.util.List;

@Data
public class OrderRequest {

    private Integer addressId;

    @Size(max = 100, message = "Tên người nhận không được vượt quá 100 ký tự")
    private String customerName;

    @Pattern(regexp = "^(0[3|5|7|8|9])+([0-9]{8})$", message = "Số điện thoại không hợp lệ")
    private String customerPhone;

    @Email(message = "Email không đúng định dạng")
    private String customerEmail;

    private String goshipShipmentId;
    private String shippingAddress;
    private String shippingWard;
    private String shippingDistrict;
    private String shippingCity;
    private String shippingWardCode;
    private String shippingDistrictCode;
    private String shippingCityCode;

    private String voucherCode;

    @NotNull(message = "Vui lòng chọn phương thức thanh toán")
    private PaymentMethod paymentMethod;

    @Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự")
    private String note;

    private Boolean isVatRequired = false;
    private String companyName;
    private String taxCode;
    private String companyAddress;

    @NotEmpty(message = "Danh sách sản phẩm không được để trống")
    @Valid
    private List<CheckoutItemRequest> items;

    @AssertTrue(message = "Vui lòng chọn địa chỉ có sẵn hoặc nhập đầy đủ thông tin giao hàng mới!")
    private boolean isValidAddress() {
        if (addressId != null) return true; // Đã có ID từ DB thì an toàn
        // Nếu không có ID, bắt buộc phải nhập tay đầy đủ
        return StringUtils.isNotBlank(customerName)
                && StringUtils.isNotBlank(customerPhone)
                && StringUtils.isNotBlank(shippingAddress)
                && StringUtils.isNotBlank(shippingCityCode)
                && StringUtils.isNotBlank(shippingDistrictCode)
                && StringUtils.isNotBlank(shippingWardCode);
    }

    // Tương tự cho hóa đơn VAT
    @AssertTrue(message = "Vui lòng nhập đầy đủ thông tin xuất hóa đơn VAT!")
    private boolean isValidVatInfo() {
        if (Boolean.FALSE.equals(isVatRequired)) return true;
        return StringUtils.isNotBlank(companyName) && StringUtils.isNotBlank(taxCode) && StringUtils.isNotBlank(companyAddress);
    }

    @Data
    public static class CheckoutItemRequest {
        @NotNull(message = "Thiếu ID biến thể sản phẩm")
        private Integer variantId;

        @NotNull(message = "Số lượng không được để trống")
        @Min(value = 1, message = "Số lượng phải từ 1 trở lên")
        private Integer quantity;

        private Integer cartItemId;
    }
}