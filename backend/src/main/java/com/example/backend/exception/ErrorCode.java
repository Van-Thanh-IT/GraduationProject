package com.example.backend.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    INVALID_INPUT(1002, "Dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST),
    INTERNAL_ERROR(9999, "Lỗi hệ thống", HttpStatus.INTERNAL_SERVER_ERROR),
    RESOURCE_NOT_FOUND(404, "Không tìm thấy tài nguyên", HttpStatus.NOT_FOUND),
    METHOD_NOT_ALLOWED(405, "Phương thức HTTP không được hỗ trợ", HttpStatus.METHOD_NOT_ALLOWED),

    INVALID_FILE_TYPE(4005, "File tải lên bắt buộc phải là hình ảnh (JPG, PNG...)!", HttpStatus.BAD_REQUEST),
    FILE_SIZE_EXCEEDED(4006, "Dung lượng ảnh không được vượt quá 5MB!", HttpStatus.PAYLOAD_TOO_LARGE),
    UPLOAD_FAILED(5001, "Tải ảnh lên máy chủ thất bại, vui lòng thử lại!", HttpStatus.INTERNAL_SERVER_ERROR),

    USER_NOT_FOUND(1001, "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    USER_EXISTED(1002, "Tên người dùng đã tồn tại", HttpStatus.CONFLICT),
    USER_EMAIL_EXISTED(1003, "Email đã được sử dụng", HttpStatus.CONFLICT),
    USER_PHONE_EXISTED(1004, "Số điện thoại đã được sử dụng", HttpStatus.CONFLICT),
    USER_DISABLED(1005, "Tài khoản đã bị khoá", HttpStatus.FORBIDDEN),
    USER_EMAIL_NOT_VERIFIED(1006, "Email chưa được xác thực", HttpStatus.FORBIDDEN),
    USER_ALREADY_TERMINATED(1007, "Tài khoản đã bị chấm dứt và không thể thay đổi trạng thái", HttpStatus.FORBIDDEN),

    ROLE_NOT_FOUND(1011, "Không tìm thấy vai trò (Role)", HttpStatus.NOT_FOUND),

    ADDRESS_NOT_FOUND(1021, "Không tìm thấy địa chỉ", HttpStatus.NOT_FOUND),
    ADDRESS_LIMIT_EXCEEDED(1022, "Vượt quá số lượng địa chỉ cho phép", HttpStatus.BAD_REQUEST),
    ADDRESS_DEFAULT_REQUIRED(
            2001, "Không thể bỏ địa chỉ mặc định. Hãy chọn địa chỉ khác trước", HttpStatus.BAD_REQUEST),
    ADDRESS_CANNOT_DELETE_DEFAULT(2002, "Không thể xóa địa chỉ mặc định", HttpStatus.BAD_REQUEST),
    ADDRESS_NOT_OWNED_BY_USER(2003, "Bạn không có quyền truy cập địa chỉ này!", HttpStatus.FORBIDDEN),

    AUTH_UNAUTHENTICATED(2001, "Bạn chưa đăng nhập", HttpStatus.UNAUTHORIZED),
    AUTH_FORBIDDEN(2002, "Bạn không có quyền truy cập tài nguyên này", HttpStatus.FORBIDDEN),
    AUTH_UNAUTHORIZED_ACTION(4031, "Bạn không có quyền thao tác!", HttpStatus.FORBIDDEN),
    //    AUTH_INVALID_CREDENTIALS(2003, "Email hoặc mật khẩu không chính xác", HttpStatus.UNAUTHORIZED),
    AUTH_PASSWORD_NOT_MATCH(2004, "Mật khẩu xác nhận không khớp", HttpStatus.BAD_REQUEST),
    AUTH_ACCOUNT_LOCKED(2005, "Tài khoản bị khoá do đăng nhập sai nhiều lần", HttpStatus.FORBIDDEN),
    AUTH_TOKEN_INVALID(2011, "Token không hợp lệ hoặc đã hết hạn", HttpStatus.UNAUTHORIZED),
    AUTH_TOKEN_EXPIRED(2012, "Token đã hết hạn, vui lòng đăng nhập lại", HttpStatus.UNAUTHORIZED),
    AUTH_OTP_INVALID(2021, "Mã xác thực OTP không hợp lệ", HttpStatus.BAD_REQUEST),
    AUTH_OTP_EXPIRED(2022, "Mã xác thực OTP đã hết hạn", HttpStatus.BAD_REQUEST),

    //
    PRODUCT_NOT_FOUND(3001, "Không tìm thấy sản phẩm", HttpStatus.NOT_FOUND),
    PRODUCT_NAME_EXISTS(3002, "Tên sản phẩm đã tồn tại", HttpStatus.CONFLICT),
    PRODUCT_OUT_OF_STOCK(3003, "Sản phẩm này hiện đang hết hàng", HttpStatus.BAD_REQUEST),
    PRODUCT_OPTION_DUPLICATE(4001, "Tên các nhóm phân loại sản phẩm không được trùng nhau!", HttpStatus.BAD_REQUEST),

    ATTRIBUTE_NOT_FOUND(3041, "Không tìm thấy thông số kỹ thuật", HttpStatus.NOT_FOUND),
    ATTRIBUTE_NAME_EXISTS(3021, "Tên thông số đã tồn tại!", HttpStatus.CONFLICT),
    PRODUCT_ATTRIBUTE_NOT_FOUND(4042, "Không tìm thấy giá trị thông số của sản phẩm!", HttpStatus.NOT_FOUND),
    PRODUCT_ATTRIBUTE_EXISTS(4091, "Sản phẩm này đã có thông số kỹ thuật tồn tại!", HttpStatus.CONFLICT),
    VARIANT_NOT_FOUND(3011, "Không tìm thấy biến thể sản phẩm ", HttpStatus.NOT_FOUND),
    VARIANT_IMAGE_NOT_FOUND(3012, "Không tìm thấy ảnh biến thể sản phẩm! ", HttpStatus.NOT_FOUND),
    VARIANT_ALREADY_EXISTS(40011, "Giá trị tùy chọn này đã tồn tại trong sản phẩm!", HttpStatus.BAD_REQUEST),
    VARIANT_EMPTY_IMAGE_UPLOAD(40010, "Vui lòng chọn ít nhất 1 ảnh!", HttpStatus.BAD_REQUEST),
    VARIANT_MULTIPLE_DEFAULT(40012, "Chỉ được cấu hình 1 biến thể mặc định khi thêm mới!", HttpStatus.BAD_REQUEST),
    DEFAULT_VARIANT_ALREADY_EXISTS(
            40013, "Sản phẩm này đã có biến thể mặc định trên hệ thống!", HttpStatus.BAD_REQUEST),

    ORDER_NOT_FOUND(4001, "Không tìm thấy đơn hàng", HttpStatus.NOT_FOUND),
    ORDER_ITEM_NOT_FOUND(4042, "Không tìm thấy thông tin sản phẩm trong đơn hàng!", HttpStatus.NOT_FOUND),
    ORDER_INVALID_AMOUNT(4001, "Giá trị đơn hàng không hợp lệ!", HttpStatus.BAD_REQUEST),
    ORDER_EMPTY_CANCEL_REASON(4003, "Vui lòng nhập lý do hủy!", HttpStatus.BAD_REQUEST),
    ORDER_INVALID_STATUS(4004, "Trạng thái đơn hàng không hợp lệ!", HttpStatus.BAD_REQUEST),
    ORDER_EMPTY_PRINT_LIST(4009, "Không tìm thấy đơn hàng nào để in!", HttpStatus.BAD_REQUEST),
    PAYMENT_NOT_FOUND(4005, "Không tìm thấy mã thanh toán!", HttpStatus.NOT_FOUND),

    WARRANTY_KEYWORD_REQUIRED(4008, "Vui lòng nhập Số điện thoại, Mã đơn hàng hoặc IMEI", HttpStatus.BAD_REQUEST),
    WARRANTY_NOT_FOUND(
            4043, "Không tìm thấy dữ liệu bảo hành cho thông tin này! Vui lòng kiểm tra lại.", HttpStatus.NOT_FOUND),

    CART_NOT_FOUND(4047, "Không tìm thấy giỏ hàng!", HttpStatus.NOT_FOUND),
    CART_ITEM_NOT_FOUND(4048, "Sản phẩm không tồn tại trong giỏ hàng!", HttpStatus.NOT_FOUND),
    CART_UNAUTHORIZED(4035, "Bạn không có quyền thao tác trên sản phẩm này!", HttpStatus.FORBIDDEN),
    CART_SESSION_REQUIRED(4014, "Phải cung cấp sessionId hoặc đăng nhập!", HttpStatus.BAD_REQUEST),

    INVENTORY_LOW_STOCK(6101, "Tồn kho không đủ để đáp ứng", HttpStatus.BAD_REQUEST),
    INVENTORY_NOTE_NOT_FOUND(6102, "Không tìm thấy phiếu kho", HttpStatus.NOT_FOUND),

    SERIAL_NOT_FOUND(6201, "Không tìm thấy số Serial/IMEI", HttpStatus.NOT_FOUND),
    SERIAL_EXISTED(6202, "Số Serial/IMEI đã tồn tại trong hệ thống", HttpStatus.CONFLICT),
    SERIAL_ALREADY_SOLD(6203, "Số Serial/IMEI này đã được bán", HttpStatus.BAD_REQUEST),
    SERIAL_INVALID_QUANTITY(4005, "Số lượng mã Serial quét không khớp với sản phẩm!", HttpStatus.BAD_REQUEST),
    SERIAL_NOT_MANAGED(4006, "Sản phẩm này không quản lý bằng Serial!", HttpStatus.BAD_REQUEST),
    SERIAL_UNAVAILABLE(4007, "Mã Serial không khả dụng!", HttpStatus.BAD_REQUEST),
    SERIAL_MISMATCH(4008, "Mã Serial không khớp với sản phẩm!", HttpStatus.BAD_REQUEST),

    VOUCHER_NOT_FOUND(4044, "Không tìm thấy Voucher hoặc Voucher đã bị xóa!", HttpStatus.NOT_FOUND),
    VOUCHER_CODE_EXISTS(4092, "Mã Voucher đã tồn tại hoặc đang được sử dụng ở chương trình khác!", HttpStatus.CONFLICT),
    VOUCHER_INVALID_DATES(4009, "Ngày bắt đầu phải diễn ra trước ngày kết thúc!", HttpStatus.BAD_REQUEST),
    VOUCHER_PERCENTAGE_EXCEED(4010, "Giảm giá phần trăm không được vượt quá 100%!", HttpStatus.BAD_REQUEST),
    VOUCHER_MISSING_MAX_DISCOUNT(
            4011, "Vui lòng nhập 'Số tiền giảm tối đa' cho mã phần trăm để tránh rủi ro!", HttpStatus.BAD_REQUEST),
    VOUCHER_INVALID(4045, "Mã giảm giá không hợp lệ hoặc không tồn tại!", HttpStatus.NOT_FOUND),
    VOUCHER_NOT_STARTED(4032, "Mã giảm giá chưa tới thời gian áp dụng!", HttpStatus.FORBIDDEN),
    VOUCHER_EXPIRED(4033, "Mã giảm giá đã hết hạn sử dụng!", HttpStatus.FORBIDDEN),
    VOUCHER_OUT_OF_USAGE(4034, "Rất tiếc, mã giảm giá đã hết lượt sử dụng!", HttpStatus.FORBIDDEN),
    VOUCHER_MIN_ORDER_NOT_MET(4000, "Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã này!", HttpStatus.BAD_REQUEST),

    //    FLASHSALE_NOT_FOUND(8011, "Chương trình Flash Sale không tồn tại", HttpStatus.NOT_FOUND),
    //    FLASHSALE_EXPIRED(8012, "Chương trình Flash Sale đã kết thúc", HttpStatus.BAD_REQUEST),
    //    FLASHSALE_LIMIT_EXCEEDED(8013, "Bạn đã vượt quá giới hạn mua sản phẩm Flash Sale", HttpStatus.BAD_REQUEST),
    FLASH_SALE_LIMIT_EXCEEDED(
            4094, "Vượt quá số lượng mua tối đa cho phép của chương trình Flash Sale!", HttpStatus.CONFLICT),

    FILE_UPLOAD_FAILED(8101, "Tải file lên máy chủ thất bại", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_TOO_LARGE(8102, "Kích thước file vượt quá giới hạn cho phép", HttpStatus.PAYLOAD_TOO_LARGE),
    FILE_FORMAT_INVALID(8103, "Định dạng file không được hỗ trợ", HttpStatus.UNSUPPORTED_MEDIA_TYPE),

    //    EXTERNAL_SERVICE_TIMEOUT(9001, "Dịch vụ đối tác không phản hồi", HttpStatus.GATEWAY_TIMEOUT),
    //    EXTERNAL_SERVICE_ERROR(9002, "Dịch vụ đối tác trả về lỗi", HttpStatus.SERVICE_UNAVAILABLE),
    //    DATABASE_ERROR(9003, "Lỗi truy xuất cơ sở dữ liệu", HttpStatus.INTERNAL_SERVER_ERROR),

    INTERNAL_SERVER_ERROR(9999, "Lỗi hệ thống không xác định, vui lòng thử lại sau", HttpStatus.INTERNAL_SERVER_ERROR),

    BRAND_NOT_FOUND(10000, "Không tìm thấy thương hiệu", HttpStatus.NOT_FOUND),
    BRAND_NAME_EXISTS(10001, "Tên thương hiệu đã tồn tại", HttpStatus.CONFLICT),
    BRAND_SLUG_EXISTS(10002, "Đường dẫn (Slug) đã tồn tại", HttpStatus.CONFLICT),

    CATEGORY_NOT_FOUND(10000, "Không tìm thấy danh mục", HttpStatus.NOT_FOUND),
    CATEGORY_NAME_EXISTS(3021, "Tên danh mục đã tồn tại", HttpStatus.CONFLICT),
    CATEGORY_CHILD_AS_PARENT_NOT_ALLOWED(3022, "Không thể chọn danh mục con làm danh mục cha", HttpStatus.BAD_REQUEST),

    ARTICLE_NOT_FOUND(3041, "Không tìm thấy id tin tức", HttpStatus.NOT_FOUND),

    REVIEW_NOT_FOUND(4041, "Đánh giá không tồn tại!", HttpStatus.NOT_FOUND),
    REVIEW_UNAUTHORIZED(
            4031, "Hành động bị từ chối! Bạn không có quyền đánh giá đơn hàng của người khác.", HttpStatus.FORBIDDEN),
    REVIEW_ORDER_NOT_COMPLETED(4003, "Bạn chỉ có thể đánh giá sau khi đơn hàng đã hoàn thành!", HttpStatus.BAD_REQUEST),
    REVIEW_ALREADY_EXISTS(
            4091,
            "Bạn đã đánh giá sản phẩm này rồi! Mỗi sản phẩm trong đơn chỉ được đánh giá 1 lần.",
            HttpStatus.CONFLICT),
    REVIEW_IMAGE_LIMIT_EXCEEDED(4004, "Chỉ được phép tải lên tối đa 5 ảnh cho mỗi đánh giá!", HttpStatus.BAD_REQUEST),
    REVIEW_INVALID_FILE_TYPE(4005, "File tải lên bắt buộc phải là hình ảnh!", HttpStatus.BAD_REQUEST),
    REVIEW_FILE_SIZE_EXCEEDED(4006, "Kích thước mỗi ảnh không được vượt quá 5MB!", HttpStatus.PAYLOAD_TOO_LARGE),
    REVIEW_INVALID_RATING(4007, "Số sao đánh giá phải từ 1 đến 5!", HttpStatus.BAD_REQUEST),

    BANNER_NOT_FOUND(4046, "Không tìm thấy Banner!", HttpStatus.NOT_FOUND),
    BANNER_DESKTOP_IMAGE_REQUIRED(
            4012, "Vui lòng tải lên ảnh Banner cho giao diện máy tính (Desktop)!", HttpStatus.BAD_REQUEST),
    BANNER_INVALID_DATES(
            4013,
            "Thời gian kết thúc (EndDate) không được trước thời gian bắt đầu (StartDate)!",
            HttpStatus.BAD_REQUEST),

    GOSHIP_API_ERROR(5001, "Lỗi kết nối hoặc API Goship từ chối!", HttpStatus.INTERNAL_SERVER_ERROR),
    GOSHIP_REJECTED(5002, "API Goship trả về lỗi!", HttpStatus.INTERNAL_SERVER_ERROR),
    DB_SYNC_ERROR_ROLLBACK(
            5003, "Lỗi lưu DB, đã rollback dữ liệu và hủy đơn trên Goship!", HttpStatus.INTERNAL_SERVER_ERROR);

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
