package com.example.backend.service;

import java.io.ByteArrayOutputStream;
import java.util.List;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import com.example.backend.dto.response.admin.AdminOrderResponse;
import com.example.backend.entity.Order;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.exception.NotFoundException;
import com.example.backend.repository.OrderRepository;
import com.lowagie.text.pdf.BaseFont;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PdfInvoiceService {

    private final TemplateEngine templateEngine;
    private final OrderRepository orderRepository;
    private final OrderService orderService;

    public byte[] generateVatInvoicePdf(Integer orderId) {
        Order order =
                orderRepository.findById(orderId).orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));

        Context context = new Context();
        context.setVariable("order", order);

        String htmlContent = templateEngine.process("vat-invoice-template", context);

        return renderHtmlToPdf(htmlContent);
    }

    public byte[] generateDeliveryNotePdf(List<String> orderCodes) {
        List<AdminOrderResponse> orders = orderService.getOrdersForPrint(orderCodes);

        Context context = new Context();
        context.setVariable("orders", orders);

        String htmlContent = templateEngine.process("delivery-note-template", context);

        return renderHtmlToPdf(htmlContent);
    }

    private byte[] renderHtmlToPdf(String htmlContent) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();

            loadVietnameseFont(renderer);

            renderer.setDocumentFromString(htmlContent);

            renderer.layout();
            renderer.createPDF(outputStream);

            return outputStream.toByteArray();
        } catch (Exception e) {
            log.error("Lỗi khi tạo PDF: ", e);
            throw new NotFoundException("Lỗi khi tạo file PDF: " + e.getMessage());
        }
    }

    private void loadVietnameseFont(ITextRenderer renderer) {
        try {
            String fontPath = new ClassPathResource("fonts/arial.ttf").getURL().toString();

            renderer.getFontResolver().addFont(fontPath, BaseFont.IDENTITY_H, BaseFont.NOT_EMBEDDED);

        } catch (Exception e) {
            log.warn("Không tìm thấy Font tiếng Việt (fonts/arial.ttf), bỏ qua nạp font.");
        }
    }
}
