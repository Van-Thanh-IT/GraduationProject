// File: src/hooks/useExport.js
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { pdfService } from '@/services/pdfService.service';
import { downloadFileFromResponse, openFileInNewTab } from '@/utils/filePdfUtils';

// 1. Tải Hóa đơn VAT
export const useDownloadInvoice = () => {
  return useMutation({
    mutationFn: (orderId) => pdfService.downloadOrderVat(orderId),
    onSuccess: (res, orderId) => {
      downloadFileFromResponse(res.data, `Hoa_Don_VAT_${orderId}.pdf`, 'application/pdf', res.headers);
      toast.success('Tải thành công!');
    },
    onError: () => toast.error('Lỗi lấy hóa đơn!')
  });
};

// 2. In phiếu giao hàng
export const usePrintDeliveryNotes = () => {
  return useMutation({
    mutationFn: (codes) => pdfService.downloadDeliveryNotes(codes),
    onSuccess: (res) => openFileInNewTab(res.data)
  });
};
