package com.example.backend.service;

import com.example.backend.dto.response.OrderResponse;
import com.example.backend.entity.Order;
import com.example.backend.repository.OrderRepository;
import com.lowagie.text.pdf.BaseFont;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PdfInvoiceService {

    private final TemplateEngine templateEngine;
    private final OrderRepository orderRepository;
    private final OrderService orderService; // Dùng để lấy list OrderResponse cho Phiếu giao hàng

    // =========================================================================
    // 1. IN HÓA ĐƠN VAT (In từng đơn một)
    // =========================================================================
    public byte[] generateVatInvoicePdf(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng"));

        Context context = new Context();
        context.setVariable("order", order);

        // Gọi file template: src/main/resources/templates/vat-invoice-template.html
        String htmlContent = templateEngine.process("vat-invoice-template", context);

        return renderHtmlToPdf(htmlContent);
    }

    // =========================================================================
    // 2. IN PHIẾU GIAO HÀNG (In hàng loạt cho shipper)
    // =========================================================================
    public byte[] generateDeliveryNotePdf(List<String> orderCodes) {
        // Lấy danh sách DTO của nhiều đơn hàng
        List<OrderResponse> orders = orderService.getOrdersForPrint(orderCodes);

        Context context = new Context();
        context.setVariable("orders", orders);

        // Gọi file template: src/main/resources/templates/delivery-note-template.html
        String htmlContent = templateEngine.process("delivery-note-template", context);

        return renderHtmlToPdf(htmlContent);
    }

    // =========================================================================
    // 3. HÀM DÙNG CHUNG: CHUYỂN HTML THÀNH PDF (Tránh lặp code)
    // =========================================================================
    private byte[] renderHtmlToPdf(String htmlContent) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();

            // Nạp font tiếng Việt an toàn
            try {
                String fontPath = new ClassPathResource("fonts/arial.ttf").getURL().toString();
                renderer.getFontResolver().addFont(fontPath, BaseFont.IDENTITY_H, BaseFont.NOT_EMBEDDED);
            } catch (Exception e) {
                log.warn("Không tìm thấy Font tiếng Việt (fonts/arial.ttf), bỏ qua nạp font.");
            }

            // Load nội dung HTML trực tiếp (Bỏ baseUrl đi để tránh lỗi thư mục static)
            renderer.setDocumentFromString(htmlContent);

            renderer.layout();
            renderer.createPDF(outputStream);

            return outputStream.toByteArray();
        } catch (Exception e) {
            log.error("Lỗi khi tạo PDF: ", e);
            throw new RuntimeException("Lỗi khi tạo file PDF: " + e.getMessage());
        }
    }
}