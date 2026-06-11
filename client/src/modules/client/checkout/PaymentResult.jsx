import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, XCircle, ShoppingBag, ArrowLeft, Loader2, Receipt, AlertCircle, CreditCard, CalendarClock } from 'lucide-react';

// Hàm format tiền tệ (VNĐ)
const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Hàm dịch mã lỗi VNPay
const getVnpayErrorMessage = (errorCode) => {
    const errorMap = {
        '24': 'Bạn đã hủy giao dịch thanh toán.',
        '11': 'Thẻ/Tài khoản chưa đăng ký dịch vụ Internet Banking.',
        '12': 'Thẻ/Tài khoản bị khóa.',
        '51': 'Tài khoản không đủ số dư để thực hiện giao dịch.',
        '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày.',
        '75': 'Ngân hàng thanh toán đang bảo trì.',
        '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định.',
    };
    return errorMap[errorCode] || 'Giao dịch không thành công do lỗi hệ thống hoặc từ phía ngân hàng.';
};

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Lấy dữ liệu từ URL Backend trả về
    const orderCode = searchParams.get('orderCode');
    const txnNo = searchParams.get('txn');
    const rawAmount = searchParams.get('amount');
    const errorCode = searchParams.get('error');
    
    const isSuccess = location.pathname.includes('success');
    const [isLoading, setIsLoading] = useState(true);

    // Tính toán số tiền thực tế (Chia 100)
    const actualAmount = rawAmount ? (Number(rawAmount) / 100) : 0;

    useEffect(() => {
        const verifyPayment = async () => {
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 800);
        };
        if (orderCode) verifyPayment();
        else setIsLoading(false);
    }, [orderCode]);

    if (isLoading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#f8fafc]">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <p className="text-slate-500 font-medium tracking-wide animate-pulse">Đang đồng bộ giao dịch...</p>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] bg-[#f8fafc] flex items-center justify-center p-4 md:p-8 font-sans">
            {/* BỘ KHUNG CHÍNH: Thay vì max-w-[480px], đổi thành max-w-4xl (rộng gấp đôi) và dùng flex-row trên Desktop */}
            <div className="bg-white max-w-4xl w-full rounded-[24px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row relative animate-slide-up">
                
                {/* Viền màu trang trí: Nằm dọc ở cạnh trái trên Desktop, nằm ngang trên đỉnh ở Mobile */}
                <div className={`absolute top-0 left-0 w-full md:w-2.5 h-2.5 md:h-full ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}`} />

                {/* ================= CỘT TRÁI: LỜI CHÀO & HÀNH ĐỘNG ================= */}
                <div className="w-full md:w-1/2 p-8 md:p-10 lg:p-12 flex flex-col justify-center items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-slate-100">
                    
                    {/* Icon */}
                    <div className="mb-6">
                        {isSuccess ? (
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-60"></div>
                                <div className="relative w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center border-[8px] border-white shadow-sm">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                                </div>
                            </div>
                        ) : (
                            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center border-[8px] border-white shadow-sm">
                                <XCircle className="w-12 h-12 text-rose-500" />
                            </div>
                        )}
                    </div>

                    {/* Text */}
                    <h2 className={`text-3xl font-black mb-3 ${isSuccess ? 'text-slate-800' : 'text-slate-800'}`}>
                        {isSuccess ? 'Thanh toán thành công!' : 'Giao dịch thất bại'}
                    </h2>
                    <p className="text-slate-500 text-[15px] leading-relaxed mb-8 md:mb-10 max-w-sm">
                        {isSuccess 
                            ? 'Cảm ơn bạn đã mua sắm tại TechStore. Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý.' 
                            : getVnpayErrorMessage(errorCode)}
                    </p>

                    {/* Buttons (Xếp ngang nhau nếu đủ chỗ) */}
                    <div className="flex flex-col sm:flex-row w-full gap-3">
                        <button 
                            onClick={() => navigate(isSuccess ? '/user/orders' : '/checkout')}
                            className={`flex-1 py-3.5 px-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5
                                ${isSuccess 
                                    ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30' 
                                    : 'bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/30'
                                }`}
                        >
                            <ShoppingBag className="w-5 h-5" />
                            <span className="whitespace-nowrap">{isSuccess ? 'Xem đơn hàng' : 'Thanh toán lại'}</span>
                        </button>
                        
                        <button 
                            onClick={() => navigate('/')}
                            className="flex-1 py-3.5 px-4 rounded-xl font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            <ArrowLeft className="w-5 h-5" /> Trang chủ
                        </button>
                    </div>
                </div>


                {/* ================= CỘT PHẢI: BIÊN LAI CHI TIẾT (RECEIPT) ================= */}
                <div className="w-full md:w-1/2 bg-slate-50/80 p-8 md:p-10 lg:p-12 flex flex-col justify-center relative">
                    {/* Họa tiết trang trí (Watermark mờ) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                        <CheckCircle2 className="w-64 h-64" />
                    </div>

                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Thông tin giao dịch</h3>
                    
                    <div className="space-y-6 relative z-10">
                        {/* Box Số tiền (Làm nổi bật) */}
                        {isSuccess && actualAmount > 0 && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                                <span className="text-slate-500 text-sm font-medium mb-1">Số tiền thanh toán</span>
                                <span className="text-4xl font-black text-emerald-600 tracking-tight">
                                    {formatVND(actualAmount)}
                                </span>
                            </div>
                        )}

                        {/* Các dòng chi tiết */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
                            {orderCode && (
                                <DetailRow icon={<Receipt />} label="Mã đơn hàng" value={orderCode} />
                            )}

                            {txnNo && isSuccess && (
                                <>
                                    <Divider />
                                    <DetailRow icon={<CreditCard />} label="Mã GD VNPay" value={txnNo} />
                                </>
                            )}

                            {!isSuccess && errorCode && (
                                <>
                                    <Divider />
                                    <DetailRow icon={<AlertCircle className="text-rose-500" />} label="Mã lỗi" value={errorCode} isError />
                                </>
                            )}

                            <Divider />
                            <DetailRow 
                                icon={<CalendarClock />} 
                                label="Thời gian" 
                                value={new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })} 
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

// ================= COMPONENT PHỤ =================

// Component hiển thị 1 dòng thông tin
const DetailRow = ({ icon, label, value, isError = false }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-slate-500">
            {React.cloneElement(icon, { className: `w-4 h-4 ${isError ? 'text-rose-500' : ''}` })}
            <span className={`text-sm font-medium ${isError ? 'text-rose-500' : ''}`}>{label}</span>
        </div>
        <span className={`font-mono text-[15px] ${isError ? 'font-bold text-rose-600' : 'font-semibold text-slate-800'}`}>
            {value}
        </span>
    </div>
);

// Component đường gạch ngang nét đứt
const Divider = () => (
    <div className="w-full border-t border-dashed border-slate-200"></div>
);

export default PaymentResult;