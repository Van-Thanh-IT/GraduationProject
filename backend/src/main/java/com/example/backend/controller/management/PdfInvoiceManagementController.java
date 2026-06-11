package com.example.backend.controller.management;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.backend.service.PdfInvoiceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class PdfInvoiceManagementController {

    private final PdfInvoiceService pdfInvoiceService;

    @GetMapping("/orders/export-vat/{orderId}")
    public ResponseEntity<byte[]> exportVat(@PathVariable Integer orderId) {

        byte[] pdfBytes = pdfInvoiceService.generateVatInvoicePdf(orderId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);

        headers.setContentDispositionFormData("inline", "Hoa_Don_VAT_" + orderId + ".pdf");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @GetMapping("/orders/export-delivery-notes")
    public ResponseEntity<byte[]> exportDeliveryNotes(@RequestParam List<String> codes) {

        byte[] pdfBytes = pdfInvoiceService.generateDeliveryNotePdf(codes);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);

        headers.setContentDispositionFormData("inline", "Phieu_Giao_Hang.pdf");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
