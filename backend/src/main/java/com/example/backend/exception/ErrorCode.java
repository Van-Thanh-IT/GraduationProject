package com.example.backend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    INTERNAL_SERVER_ERROR(1000, "Lỗi hệ thống không xác định, vui lòng thử lại sau", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_INPUT(1001, "Dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST),
    RESOURCE_NOT_FOUND(1002, "Không tìm thấy tài nguyên", HttpStatus.NOT_FOUND),
    METHOD_NOT_ALLOWED(1003, "Phương thức HTTP không được hỗ trợ", HttpStatus.METHOD_NOT_ALLOWED),

    FILE_UPLOAD_FAILED(1100, "Tải file lên máy chủ thất bại", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_TOO_LARGE(1101, "Kích thước file vượt quá giới hạn cho phép", HttpStatus.PAYLOAD_TOO_LARGE),
    FILE_FORMAT_INVALID(1102, "Định dạng file không được hỗ trợ", HttpStatus.UNSUPPORTED_MEDIA_TYPE),
    INVALID_FILE_TYPE(1103, "File tải lên bắt buộc phải là hình ảnh (JPG, PNG...)!", HttpStatus.BAD_REQUEST),
    FILE_SIZE_EXCEEDED(1104, "Dung lượng ảnh không được vượt quá 5MB!", HttpStatus.PAYLOAD_TOO_LARGE),
    UPLOAD_FAILED(1105, "Tải ảnh lên máy chủ thất bại, vui lòng thử lại!", HttpStatus.INTERNAL_SERVER_ERROR),

    AUTH_UNAUTHENTICATED(2000, "Bạn chưa đăng nhập", HttpStatus.UNAUTHORIZED),
    AUTH_FORBIDDEN(2001, "Bạn không có quyền truy cập tài nguyên này", HttpStatus.FORBIDDEN),
    AUTH_UNAUTHORIZED_ACTION(2002, "Bạn không có quyền thao tác!", HttpStatus.FORBIDDEN),
    AUTH_PASSWORD_NOT_MATCH(2003, "Mật khẩu xác nhận không khớp", HttpStatus.BAD_REQUEST),
    AUTH_ACCOUNT_LOCKED(2004, "Tài khoản bị khoá do đăng nhập sai nhiều lần", HttpStatus.FORBIDDEN),
    AUTH_TOKEN_INVALID(2005, "Token không hợp lệ hoặc đã hết hạn", HttpStatus.UNAUTHORIZED),
    AUTH_TOKEN_EXPIRED(2006, "Token đã hết hạn, vui lòng đăng nhập lại", HttpStatus.UNAUTHORIZED),
    AUTH_OTP_INVALID(2007, "Mã xác thực OTP không hợp lệ", HttpStatus.BAD_REQUEST),
    AUTH_OTP_EXPIRED(2008, "Mã xác thực OTP đã hết hạn", HttpStatus.BAD_REQUEST),

    USER_NOT_FOUND(2100, "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    USER_EXISTED(2101, "Tên người dùng đã tồn tại", HttpStatus.CONFLICT),
    USER_EMAIL_EXISTED(2102, "Email đã được sử dụng", HttpStatus.CONFLICT),
    USER_PHONE_EXISTED(2103, "Số điện thoại đã được sử dụng", HttpStatus.CONFLICT),
    USER_DISABLED(2104, "Tài khoản đã bị khoá", HttpStatus.FORBIDDEN),
    USER_EMAIL_NOT_VERIFIED(2105, "Email chưa được xác thực", HttpStatus.FORBIDDEN),
    USER_ALREADY_TERMINATED(2106, "Tài khoản đã bị chấm dứt và không thể thay đổi trạng thái", HttpStatus.FORBIDDEN),
    ROLE_NOT_FOUND(2107, "Không tìm thấy vai trò (Role)", HttpStatus.NOT_FOUND),
    USER_ALREADY_VERIFIED(2108, "Tài khoản này đã được kích hoạt.", HttpStatus.CONFLICT),

    ADDRESS_NOT_FOUND(2200, "Không tìm thấy địa chỉ", HttpStatus.NOT_FOUND),
    ADDRESS_LIMIT_EXCEEDED(2201, "Vượt quá số lượng địa chỉ cho phép", HttpStatus.BAD_REQUEST),
    ADDRESS_DEFAULT_REQUIRED(2202, "Không thể bỏ địa chỉ mặc định. Hãy chọn địa chỉ khác trước", HttpStatus.BAD_REQUEST),
    ADDRESS_CANNOT_DELETE_DEFAULT(2203, "Không thể xóa địa chỉ mặc định", HttpStatus.BAD_REQUEST),
    ADDRESS_NOT_OWNED_BY_USER(2204, "Bạn không có quyền truy cập địa chỉ này!", HttpStatus.FORBIDDEN),

    CATEGORY_NOT_FOUND(3000, "Không tìm thấy danh mục", HttpStatus.NOT_FOUND),
    CATEGORY_NAME_EXISTS(3001, "Tên danh mục đã tồn tại", HttpStatus.CONFLICT),
    CATEGORY_CHILD_AS_PARENT_NOT_ALLOWED(3002, "Không thể chọn danh mục con làm danh mục cha", HttpStatus.BAD_REQUEST),

    BRAND_NOT_FOUND(3100, "Không tìm thấy thương hiệu", HttpStatus.NOT_FOUND),
    BRAND_NAME_EXISTS(3101, "Tên thương hiệu đã tồn tại", HttpStatus.CONFLICT),
    BRAND_SLUG_EXISTS(3102, "Đường dẫn (Slug) đã tồn tại", HttpStatus.CONFLICT),

    PRODUCT_NOT_FOUND(3200, "Không tìm thấy sản phẩm", HttpStatus.NOT_FOUND),
    PRODUCT_NAME_EXISTS(3201, "Tên sản phẩm đã tồn tại", HttpStatus.CONFLICT),
    PRODUCT_OUT_OF_STOCK(3202, "Sản phẩm này hiện đang hết hàng", HttpStatus.BAD_REQUEST),
    PRODUCT_OPTION_DUPLICATE(3203, "Tên các nhóm phân loại sản phẩm không được trùng nhau!", HttpStatus.BAD_REQUEST),

    ATTRIBUTE_NOT_FOUND(3300, "Không tìm thấy thông số kỹ thuật", HttpStatus.NOT_FOUND),
    ATTRIBUTE_NAME_EXISTS(3301, "Tên thông số đã tồn tại!", HttpStatus.CONFLICT),
    PRODUCT_ATTRIBUTE_NOT_FOUND(3302, "Không tìm thấy giá trị thông số của sản phẩm!", HttpStatus.NOT_FOUND),
    PRODUCT_ATTRIBUTE_EXISTS(3303, "Sản phẩm này đã có thông số kỹ thuật tồn tại!", HttpStatus.CONFLICT),

    VARIANT_NOT_FOUND(3400, "Không tìm thấy biến thể sản phẩm", HttpStatus.NOT_FOUND),
    VARIANT_IMAGE_NOT_FOUND(3401, "Không tìm thấy ảnh biến thể sản phẩm!", HttpStatus.NOT_FOUND),
    VARIANT_ALREADY_EXISTS(3402, "Giá trị tùy chọn này đã tồn tại trong sản phẩm!", HttpStatus.BAD_REQUEST),
    VARIANT_EMPTY_IMAGE_UPLOAD(3403, "Vui lòng chọn ít nhất 1 ảnh!", HttpStatus.BAD_REQUEST),
    VARIANT_MULTIPLE_DEFAULT(3404, "Chỉ được cấu hình 1 biến thể mặc định khi thêm mới!", HttpStatus.BAD_REQUEST),
    DEFAULT_VARIANT_ALREADY_EXISTS(3405, "Sản phẩm này đã có biến thể mặc định trên hệ thống!", HttpStatus.BAD_REQUEST),

    CART_NOT_FOUND(4000, "Không tìm thấy giỏ hàng!", HttpStatus.NOT_FOUND),
    CART_ITEM_NOT_FOUND(4001, "Sản phẩm không tồn tại trong giỏ hàng!", HttpStatus.NOT_FOUND),
    CART_UNAUTHORIZED(4002, "Bạn không có quyền thao tác trên sản phẩm này!", HttpStatus.FORBIDDEN),
    CART_SESSION_REQUIRED(4003, "Phải cung cấp sessionId hoặc đăng nhập!", HttpStatus.BAD_REQUEST),

    ORDER_NOT_FOUND(4100, "Không tìm thấy đơn hàng", HttpStatus.NOT_FOUND),
    ORDER_ITEM_NOT_FOUND(4101, "Không tìm thấy thông tin sản phẩm trong đơn hàng!", HttpStatus.NOT_FOUND),
    ORDER_INVALID_AMOUNT(4102, "Giá trị đơn hàng không hợp lệ!", HttpStatus.BAD_REQUEST),
    ORDER_EMPTY_CANCEL_REASON(4103, "Vui lòng nhập lý do hủy!", HttpStatus.BAD_REQUEST),
    ORDER_INVALID_STATUS(4104, "Trạng thái đơn hàng không hợp lệ!", HttpStatus.BAD_REQUEST),
    ORDER_EMPTY_PRINT_LIST(4105, "Không tìm thấy đơn hàng nào để in!", HttpStatus.BAD_REQUEST),
    PAYMENT_NOT_FOUND(4106, "Không tìm thấy mã thanh toán!", HttpStatus.NOT_FOUND),

    INVENTORY_LOW_STOCK(5000, "Tồn kho không đủ để đáp ứng", HttpStatus.BAD_REQUEST),
    INVENTORY_NOTE_NOT_FOUND(5001, "Không tìm thấy phiếu kho", HttpStatus.NOT_FOUND),

    SERIAL_NOT_FOUND(5100, "Không tìm thấy số Serial/IMEI", HttpStatus.NOT_FOUND),
    SERIAL_EXISTED(5101, "Số Serial/IMEI đã tồn tại trong hệ thống", HttpStatus.CONFLICT),
    SERIAL_ALREADY_SOLD(5102, "Số Serial/IMEI này đã được bán", HttpStatus.BAD_REQUEST),
    SERIAL_INVALID_QUANTITY(5103, "Số lượng mã Serial quét không khớp với sản phẩm!", HttpStatus.BAD_REQUEST),
    SERIAL_NOT_MANAGED(5104, "Sản phẩm này không quản lý bằng Serial!", HttpStatus.BAD_REQUEST),
    SERIAL_UNAVAILABLE(5105, "Mã Serial không khả dụng!", HttpStatus.BAD_REQUEST),
    SERIAL_MISMATCH(5106, "Mã Serial không khớp với sản phẩm!", HttpStatus.BAD_REQUEST),

    WARRANTY_KEYWORD_REQUIRED(5200, "Vui lòng nhập Số điện thoại, Mã đơn hàng hoặc IMEI", HttpStatus.BAD_REQUEST),
    WARRANTY_NOT_FOUND(5201, "Không tìm thấy dữ liệu bảo hành cho thông tin này! Vui lòng kiểm tra lại.", HttpStatus.NOT_FOUND),

    VOUCHER_NOT_FOUND(6000, "Không tìm thấy Voucher hoặc Voucher đã bị xóa!", HttpStatus.NOT_FOUND),
    VOUCHER_CODE_EXISTS(6001, "Mã Voucher đã tồn tại hoặc đang được sử dụng ở chương trình khác!", HttpStatus.CONFLICT),
    VOUCHER_INVALID_DATES(6002, "Ngày bắt đầu phải diễn ra trước ngày kết thúc!", HttpStatus.BAD_REQUEST),
    VOUCHER_PERCENTAGE_EXCEED(6003, "Giảm giá phần trăm không được vượt quá 100%!", HttpStatus.BAD_REQUEST),
    VOUCHER_MISSING_MAX_DISCOUNT(6004, "Vui lòng nhập 'Số tiền giảm tối đa' cho mã phần trăm để tránh rủi ro!", HttpStatus.BAD_REQUEST),
    VOUCHER_INVALID(6005, "Mã giảm giá không hợp lệ hoặc không tồn tại!", HttpStatus.NOT_FOUND),
    VOUCHER_NOT_STARTED(6006, "Mã giảm giá chưa tới thời gian áp dụng!", HttpStatus.FORBIDDEN),
    VOUCHER_EXPIRED(6007, "Mã giảm giá đã hết hạn sử dụng!", HttpStatus.FORBIDDEN),
    VOUCHER_OUT_OF_USAGE(6008, "Rất tiếc, mã giảm giá đã hết lượt sử dụng!", HttpStatus.FORBIDDEN),
    VOUCHER_MIN_ORDER_NOT_MET(6009, "Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã này!", HttpStatus.BAD_REQUEST),

    FLASH_SALE_LIMIT_EXCEEDED(6100, "Vượt quá số lượng mua tối đa cho phép của chương trình Flash Sale!", HttpStatus.CONFLICT),

    ARTICLE_NOT_FOUND(7000, "Không tìm thấy id tin tức", HttpStatus.NOT_FOUND),

    BANNER_NOT_FOUND(7100, "Không tìm thấy Banner!", HttpStatus.NOT_FOUND),
    BANNER_DESKTOP_IMAGE_REQUIRED(7101, "Vui lòng tải lên ảnh Banner cho giao diện máy tính (Desktop)!", HttpStatus.BAD_REQUEST),
    BANNER_INVALID_DATES(7102, "Thời gian kết thúc (EndDate) không được trước thời gian bắt đầu (StartDate)!", HttpStatus.BAD_REQUEST),
    BANNER_START_DATE_IN_PAST(7103, "Thời gian bắt đầu không được nằm trong quá khứ!", HttpStatus.BAD_REQUEST),

    REVIEW_NOT_FOUND(7200, "Đánh giá không tồn tại!", HttpStatus.NOT_FOUND),
    REVIEW_UNAUTHORIZED(7201, "Hành động bị từ chối! Bạn không có quyền đánh giá đơn hàng của người khác.", HttpStatus.FORBIDDEN),
    REVIEW_ORDER_NOT_COMPLETED(7202, "Bạn chỉ có thể đánh giá sau khi đơn hàng đã hoàn thành!", HttpStatus.BAD_REQUEST),
    REVIEW_ALREADY_EXISTS(7203, "Bạn đã đánh giá sản phẩm này rồi! Mỗi sản phẩm trong đơn chỉ được đánh giá 1 lần.", HttpStatus.CONFLICT),
    REVIEW_IMAGE_LIMIT_EXCEEDED(7204, "Chỉ được phép tải lên tối đa 5 ảnh cho mỗi đánh giá!", HttpStatus.BAD_REQUEST),
    REVIEW_INVALID_FILE_TYPE(7205, "File tải lên bắt buộc phải là hình ảnh!", HttpStatus.BAD_REQUEST),
    REVIEW_FILE_SIZE_EXCEEDED(7206, "Kích thước mỗi ảnh không được vượt quá 5MB!", HttpStatus.PAYLOAD_TOO_LARGE),
    REVIEW_INVALID_RATING(7207, "Số sao đánh giá phải từ 1 đến 5!", HttpStatus.BAD_REQUEST),

    GOSHIP_API_ERROR(8000, "Lỗi kết nối hoặc API Goship từ chối!", HttpStatus.INTERNAL_SERVER_ERROR),
    GOSHIP_REJECTED(8001, "API Goship trả về lỗi!", HttpStatus.INTERNAL_SERVER_ERROR),
    DB_SYNC_ERROR_ROLLBACK(8002, "Lỗi lưu DB, đã rollback dữ liệu và hủy đơn trên Goship!", HttpStatus.INTERNAL_SERVER_ERROR);

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }

}