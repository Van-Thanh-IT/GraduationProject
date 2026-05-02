package com.example.backend.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {


    //COMMON SYSTEM ERRORS (Lỗi chung)
    INVALID_INPUT(400, "Dữ liệu đầu vào không hợp lệ", HttpStatus.BAD_REQUEST),
    MISSING_PARAMETER(400, "Thiếu tham số bắt buộc", HttpStatus.BAD_REQUEST),
    RESOURCE_NOT_FOUND(404, "Không tìm thấy tài nguyên", HttpStatus.NOT_FOUND),
    METHOD_NOT_ALLOWED(405, "Phương thức HTTP không được hỗ trợ", HttpStatus.METHOD_NOT_ALLOWED),


    //USER & ROLE (Người dùng, Phân quyền)
    USER_NOT_FOUND(1001, "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    USER_EXISTED(1002, "Tên người dùng đã tồn tại", HttpStatus.CONFLICT),
    USER_EMAIL_EXISTED(1003, "Email đã được sử dụng", HttpStatus.CONFLICT),
    USER_PHONE_EXISTED(1004, "Số điện thoại đã được sử dụng", HttpStatus.CONFLICT),
    USER_DISABLED(1005, "Tài khoản đã bị khoá", HttpStatus.FORBIDDEN),
    USER_EMAIL_NOT_VERIFIED(1006, "Email chưa được xác thực", HttpStatus.FORBIDDEN),
    USER_ALREADY_TERMINATED(1007, "Tài khoản đã bị chấm dứt và không thể thay đổi trạng thái", HttpStatus.FORBIDDEN),


    ROLE_NOT_FOUND(1011, "Không tìm thấy vai trò (Role)", HttpStatus.NOT_FOUND),
    PERMISSION_NOT_FOUND(1012, "Không tìm thấy quyền hạn (Permission)", HttpStatus.NOT_FOUND),

    ADDRESS_NOT_FOUND(1021, "Không tìm thấy địa chỉ giao hàng", HttpStatus.NOT_FOUND),
    ADDRESS_LIMIT_EXCEEDED(1022, "Vượt quá số lượng địa chỉ cho phép", HttpStatus.BAD_REQUEST),


    //AUTHENTICATION & SECURITY (Bảo mật)
    AUTH_UNAUTHENTICATED(2001, "Bạn chưa đăng nhập", HttpStatus.UNAUTHORIZED),
    AUTH_FORBIDDEN(2002, "Bạn không có quyền truy cập tài nguyên này", HttpStatus.FORBIDDEN),
    AUTH_INVALID_CREDENTIALS(2003, "Email hoặc mật khẩu không chính xác", HttpStatus.UNAUTHORIZED),
    AUTH_PASSWORD_NOT_MATCH(2004, "Mật khẩu xác nhận không khớp", HttpStatus.BAD_REQUEST),
    AUTH_ACCOUNT_LOCKED(2005, "Tài khoản bị khoá do đăng nhập sai nhiều lần", HttpStatus.FORBIDDEN),

    AUTH_TOKEN_INVALID(2011, "Token không hợp lệ hoặc đã hết hạn", HttpStatus.UNAUTHORIZED),
    AUTH_TOKEN_EXPIRED(2012, "Token đã hết hạn, vui lòng đăng nhập lại", HttpStatus.UNAUTHORIZED),

    AUTH_OTP_INVALID(2021, "Mã xác thực OTP không hợp lệ", HttpStatus.BAD_REQUEST),
    AUTH_OTP_EXPIRED(2022, "Mã xác thực OTP đã hết hạn", HttpStatus.BAD_REQUEST),


    //CATALOG (Sản phẩm, Danh mục, Biến thể)
    PRODUCT_NOT_FOUND(3001, "Không tìm thấy sản phẩm", HttpStatus.NOT_FOUND),
    PRODUCT_EXISTED(3002, "Tên sản phẩm đã tồn tại", HttpStatus.CONFLICT),
    PRODUCT_OUT_OF_STOCK(3003, "Sản phẩm này hiện đang hết hàng", HttpStatus.BAD_REQUEST),

    VARIANT_NOT_FOUND(3011, "Không tìm thấy phiên bản sản phẩm (Variant)", HttpStatus.NOT_FOUND),
    CATEGORY_NOT_FOUND(3021, "Không tìm thấy danh mục", HttpStatus.NOT_FOUND),
    BRAND_NOT_FOUND(3031, "Không tìm thấy thương hiệu", HttpStatus.NOT_FOUND),
    ATTRIBUTE_NOT_FOUND(3041, "Không tìm thấy thông số kỹ thuật", HttpStatus.NOT_FOUND),

    // ==========================================
    // 4xxx: ORDER (Đơn hàng)
    // ==========================================
    ORDER_NOT_FOUND(4001, "Không tìm thấy đơn hàng", HttpStatus.NOT_FOUND),
    ORDER_INVALID_STATUS(4002, "Trạng thái đơn hàng không hợp lệ", HttpStatus.BAD_REQUEST),
    ORDER_CANNOT_CANCEL(4003, "Không thể huỷ đơn hàng ở trạng thái hiện tại", HttpStatus.BAD_REQUEST),
    ORDER_CANNOT_RETURN(4004, "Đơn hàng không đủ điều kiện hoàn trả", HttpStatus.BAD_REQUEST),
    ORDER_PAYMENT_PENDING(4005, "Đơn hàng đang chờ thanh toán", HttpStatus.BAD_REQUEST),

    // ==========================================
    // 5xxx: PAYMENT (Thanh toán)
    // ==========================================
    PAYMENT_NOT_FOUND(5001, "Không tìm thấy giao dịch thanh toán", HttpStatus.NOT_FOUND),
    PAYMENT_FAILED(5002, "Giao dịch thanh toán thất bại", HttpStatus.PAYMENT_REQUIRED),
    PAYMENT_INVALID_AMOUNT(5003, "Số tiền thanh toán không khớp với đơn hàng", HttpStatus.BAD_REQUEST),
    PAYMENT_ALREADY_PROCESSED(5004, "Giao dịch này đã được xử lý", HttpStatus.CONFLICT),

    //CART & INVENTORY (Giỏ hàng & Kho hàng)
    CART_NOT_FOUND(6001, "Không tìm thấy giỏ hàng", HttpStatus.NOT_FOUND),
    CART_EMPTY(6002, "Giỏ hàng đang trống", HttpStatus.BAD_REQUEST),
    CART_ITEM_NOT_FOUND(6003, "Sản phẩm không có trong giỏ hàng", HttpStatus.NOT_FOUND),

    INVENTORY_LOW_STOCK(6101, "Tồn kho không đủ để đáp ứng", HttpStatus.BAD_REQUEST),
    INVENTORY_NOTE_NOT_FOUND(6102, "Không tìm thấy phiếu kho", HttpStatus.NOT_FOUND),

    // Đặc thù Tech Store (IMEI/Serial)
    SERIAL_NOT_FOUND(6201, "Không tìm thấy số Serial/IMEI", HttpStatus.NOT_FOUND),
    SERIAL_EXISTED(6202, "Số Serial/IMEI đã tồn tại trong hệ thống", HttpStatus.CONFLICT),
    SERIAL_ALREADY_SOLD(6203, "Số Serial/IMEI này đã được bán", HttpStatus.BAD_REQUEST),

    //SHIPPING (Vận chuyển)
    SHIPMENT_NOT_FOUND(7001, "Không tìm thấy thông tin vận đơn", HttpStatus.NOT_FOUND),
    SHIPMENT_API_ERROR(7002, "Lỗi kết nối đến đối tác vận chuyển", HttpStatus.SERVICE_UNAVAILABLE),
    SHIPMENT_INVALID_ADDRESS(7003, "Địa chỉ giao hàng không hợp lệ", HttpStatus.BAD_REQUEST),


    //PROMOTION, REVIEWS & FILES
    VOUCHER_NOT_FOUND(8001, "Không tìm thấy mã giảm giá", HttpStatus.NOT_FOUND),
    VOUCHER_EXPIRED(8002, "Mã giảm giá đã hết hạn", HttpStatus.BAD_REQUEST),
    VOUCHER_OUT_OF_USAGE(8003, "Mã giảm giá đã hết lượt sử dụng", HttpStatus.BAD_REQUEST),
    VOUCHER_MIN_ORDER_NOT_MET(8004, "Đơn hàng chưa đạt giá trị tối thiểu để áp dụng", HttpStatus.BAD_REQUEST),

    FLASHSALE_NOT_FOUND(8011, "Chương trình Flash Sale không tồn tại", HttpStatus.NOT_FOUND),
    FLASHSALE_EXPIRED(8012, "Chương trình Flash Sale đã kết thúc", HttpStatus.BAD_REQUEST),
    FLASHSALE_LIMIT_EXCEEDED(8013, "Bạn đã vượt quá giới hạn mua sản phẩm Flash Sale", HttpStatus.BAD_REQUEST),

    REVIEW_NOT_ELIGIBLE(8021, "Bạn phải mua sản phẩm mới được đánh giá", HttpStatus.FORBIDDEN),
    REVIEW_ALREADY_SUBMITTED(8022, "Bạn đã đánh giá sản phẩm này rồi", HttpStatus.CONFLICT),

    FILE_UPLOAD_FAILED(8101, "Tải file lên máy chủ thất bại", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_TOO_LARGE(8102, "Kích thước file vượt quá giới hạn cho phép", HttpStatus.PAYLOAD_TOO_LARGE),
    FILE_FORMAT_INVALID(8103, "Định dạng file không được hỗ trợ", HttpStatus.UNSUPPORTED_MEDIA_TYPE),


    //SYSTEM & EXTERNAL SERVICES (Hệ thống)
    EXTERNAL_SERVICE_TIMEOUT(9001, "Dịch vụ đối tác không phản hồi", HttpStatus.GATEWAY_TIMEOUT),
    EXTERNAL_SERVICE_ERROR(9002, "Dịch vụ đối tác trả về lỗi", HttpStatus.SERVICE_UNAVAILABLE),
    DATABASE_ERROR(9003, "Lỗi truy xuất cơ sở dữ liệu", HttpStatus.INTERNAL_SERVER_ERROR),

    INTERNAL_SERVER_ERROR(9999, "Lỗi hệ thống không xác định, vui lòng thử lại sau", HttpStatus.INTERNAL_SERVER_ERROR);

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}