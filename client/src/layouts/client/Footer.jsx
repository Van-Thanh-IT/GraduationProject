// File: src/components/Footer.jsx
import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube, CreditCard, ShieldCheck, Truck } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 p-3 border-t border-gray-800 font-sans">
            
            {/* CÁC CHÍNH SÁCH NỔI BẬT */}
            <div className="container mx-auto px-4 mb-8 border-b border-gray-800 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="flex flex-col items-center justify-center space-y-1.5">
                        <ShieldCheck className="w-8 h-8 text-blue-500" />
                        <h4 className="text-white font-bold text-sm uppercase tracking-wide">Bảo hành chính hãng</h4>
                        <p className="text-xs text-gray-400 max-w-xs m-0">Cam kết 100% hàng chính hãng, bảo hành lên đến 24 tháng.</p>
                    </div>
                    <div className="flex flex-col items-center justify-center space-y-1.5">
                        <Truck className="w-8 h-8 text-blue-500" />
                        <h4 className="text-white font-bold text-sm uppercase tracking-wide">Giao hàng toàn quốc</h4>
                        <p className="text-xs text-gray-400 max-w-xs m-0">Miễn phí vận chuyển cho đơn hàng từ 5.000.000đ.</p>
                    </div>
                    <div className="flex flex-col items-center justify-center space-y-1.5">
                        <CreditCard className="w-8 h-8 text-blue-500" />
                        <h4 className="text-white font-bold text-sm uppercase tracking-wide">Thanh toán linh hoạt</h4>
                        <p className="text-xs text-gray-400 max-w-xs m-0">Hỗ trợ trả góp 0% qua thẻ tín dụng và công ty tài chính.</p>
                    </div>
                </div>
            </div>

            {/* NỘI DUNG CHÍNH CHIA 4 CỘT */}
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                    
                    {/* CỘT 1: THÔNG TIN LIÊN HỆ */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-bold text-white m-0">
                            <span className="text-blue-500">Tech</span>Store
                        </h3>
                        <p className="text-xs leading-relaxed text-gray-400 m-0">
                            Hệ thống bán lẻ các thiết bị điện tử, điện thoại, máy tính và phụ kiện công nghệ hàng đầu Việt Nam.
                        </p>
                        <ul className="space-y-2 pt-1 p-0 m-0 list-none">
                            <li className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <span className="text-xs text-gray-400">Tầng 3, Tòa nhà Tech, Cầu Giấy, Hà Nội</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                                <span className="text-xs text-gray-400">Hotline: <strong className="text-white font-semibold">1900 8888</strong></span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                                <span className="text-xs text-gray-400">cskh@techstore.vn</span>
                            </li>
                        </ul>
                    </div>

                    {/* CỘT 2: SẢN PHẨM */}
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase tracking-wide mb-3 m-0">Sản Phẩm</h4>
                        <ul className="space-y-2 p-0 m-0 list-none">
                            <li><a href="#" className="text-xs text-gray-400 hover:text-blue-400 transition-colors no-underline">Điện thoại iPhone</a></li>
                            <li><a href="#" className="text-xs text-gray-400 hover:text-blue-400 transition-colors no-underline">Laptop / Macbook</a></li>
                            <li><a href="#" className="text-xs text-gray-400 hover:text-blue-400 transition-colors no-underline">Máy tính bảng (Tablet)</a></li>
                            <li><a href="#" className="text-xs text-gray-400 hover:text-blue-400 transition-colors no-underline">Phụ kiện công nghệ</a></li>
                            <li><a href="#" className="text-xs text-gray-400 hover:text-blue-400 transition-colors no-underline">Đồng hồ thông minh</a></li>
                        </ul>
                    </div>

                    {/* CỘT 3: GOOGLE MAP TỰ ĐỘNG KHÍT KHUNG */}
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase tracking-wide mb-3 m-0">Bản Đồ Cửa Hàng</h4>
                        <div className="bg-gray-800 p-1 rounded-lg border border-gray-800 overflow-hidden h-[140px] w-full">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d930.9657409268152!2d105.77451720704842!3d21.03816848208359!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454c9d9e80ad1%3A0xa8834169e964c217!2zVHLGsOG7nW5nIEPDoW4gQuG7mSBRdeG6o24gTMO9IFbEg24gSG_DoSBUaMOqIFRoYW8gRHUgTOG7i2No!5e0!3m2!1svi!2s!4v1775656854538!5m2!1svi!2s" 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0, borderRadius: '0.375rem' }} 
                                allowFullScreen="" 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Google Map"
                            ></iframe>
                        </div>
                    </div>

                    {/* CỘT 4: NHẬN TIN & MẠNG XÃ HỘI */}
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase tracking-wide mb-3 m-0">Đăng Ký Nhận Tin</h4>
                        <p className="text-xs text-gray-400 mb-2.5 m-0">Nhận ngay mã giảm giá 10% cho đơn hàng đầu tiên khi đăng ký.</p>
                        <form className="flex mb-4" onSubmit={(e) => e.preventDefault()}>
                            <input 
                                type="email" 
                                placeholder="Nhập email..." 
                                className="w-full px-3 h-8.5 bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500 rounded-l-md text-xs"
                            />
                            <button type="submit" className="px-4 h-8.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors rounded-r-md text-xs shrink-0">
                                Gửi
                            </button>
                        </form>
                        
                        <div className="flex gap-2.5 mt-1">
                            <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors text-white">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors text-white">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-red-600 transition-colors text-white">
                                <Youtube className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-400 transition-colors text-white">
                                <Twitter className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                </div>
            </div>

            {/* COPYRIGHT & PAYMENT */}
            <div className="container mx-auto px-4 mt-8 pt-4 border-t border-gray-800">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                    <p className="text-[11px] text-gray-500 text-center sm:text-left m-0">
                        © {new Date().getFullYear()} TechStore. Tất cả các quyền được bảo lưu.
                    </p>
                    <div className="flex gap-1.5">
                        <div className="px-2 py-0.5 bg-gray-800 rounded text-[9px] font-bold text-gray-400 border border-gray-700">VISA</div>
                        <div className="px-2 py-0.5 bg-gray-800 rounded text-[9px] font-bold text-gray-400 border border-gray-700">MASTER</div>
                        <div className="px-2 py-0.5 bg-gray-800 rounded text-[9px] font-bold text-gray-400 border border-gray-700">MOMO</div>
                        <div className="px-2 py-0.5 bg-gray-800 rounded text-[9px] font-bold text-gray-400 border border-gray-700">VNPAY</div>
                    </div>
                </div>
            </div>
            
        </footer>
    );
};

export default Footer;