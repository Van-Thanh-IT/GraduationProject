import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, XCircle, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Lấy mã đơn hàng từ tham số URL (?orderCode=...)
    const orderCode = searchParams.get('orderCode');
    
    // Xác định trạng thái dựa trên URL path (vd: /payment/success hoặc /payment/failed)
    const isSuccess = location.pathname.includes('success');
    
    // State loading mô phỏng nạp dữ liệu (tùy chọn)
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Tùy chọn: Gọi API tới backend để xác thực lại trạng thái đơn hàng thực tế
        // Tránh trường hợp user tự gõ URL /payment/success
        const verifyPayment = async () => {
            setIsLoading(true);
            try {
                // Xử lý API ở đây nếu cần thiết...
                // const res = await api.get(`/orders/${orderCode}`);
                
                // Tạm thời dùng setTimeout để giả lập độ trễ
                setTimeout(() => setIsLoading(false), 800);
            } catch (error) {
                console.error("Lỗi xác thực thanh toán", error);
                setIsLoading(false);
            }
        };

        if (orderCode) {
            verifyPayment();
        } else {
            setIsLoading(false);
        }
    }, [orderCode]);

    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Đang xác thực giao dịch...</p>
            </div>
        );
    }

    return (
        <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center p-4 py-12">
            <div className="bg-white max-w-lg w-full rounded-2xl shadow-lg border border-gray-100 p-8 text-center transform transition-all">
                
                {/* 1. Icon Trạng thái */}
                <div className="flex justify-center mb-6">
                    {isSuccess ? (
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                        </div>
                    ) : (
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                            <XCircle className="w-12 h-12 text-red-600" />
                        </div>
                    )}
                </div>

                {/* 2. Tiêu đề */}
                <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${isSuccess ? 'text-emerald-700' : 'text-red-700'}`}>
                    {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
                </h2>
                
                {/* 3. Lời nhắn */}
                <p className="text-gray-600 mb-6 text-sm md:text-base">
                    {isSuccess 
                        ? 'Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đã được ghi nhận và đang trong quá trình xử lý.' 
                        : 'Đã có lỗi xảy ra trong quá trình thanh toán qua VNPay hoặc bạn đã hủy giao dịch.'}
                </p>

                {/* 4. Thông tin mã đơn hàng */}
                {orderCode && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100">
                        <p className="text-gray-500 text-sm mb-1">Mã đơn hàng của bạn</p>
                        <p className="text-lg font-mono font-bold text-gray-800 tracking-wider">
                            {orderCode}
                        </p>
                    </div>
                )}

                {/* 5. Nút điều hướng */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button 
                        onClick={() => navigate('/')}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Về trang chủ
                    </button>
                    
                    <button 
                        onClick={() => navigate(isSuccess ? '/user/orders' : '/checkout')}
                        className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-white transition-colors flex items-center justify-center gap-2 shadow-sm
                            ${isSuccess 
                                ? 'bg-blue-600 hover:bg-blue-700' 
                                : 'bg-red-600 hover:bg-red-700'
                            }`}
                    >
                        <ShoppingBag className="w-4 h-4" />
                        {isSuccess ? 'Xem đơn hàng' : 'Thanh toán lại'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PaymentResult;