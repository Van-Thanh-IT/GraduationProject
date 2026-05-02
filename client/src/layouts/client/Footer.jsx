import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube, CreditCard, ShieldCheck, Truck } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800 font-sans">
            {/* 1. Phần Features nổi bật (Tùy chọn) */}
            <div className="container mx-auto px-4 mb-12 border-b border-gray-800 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <ShieldCheck className="w-10 h-10 text-blue-500" />
                        <h4 className="text-white font-semibold text-lg">Bảo hành chính hãng</h4>
                        <p className="text-sm text-gray-400">Cam kết 100% hàng chính hãng, bảo hành lên đến 24 tháng.</p>
                    </div>
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <Truck className="w-10 h-10 text-blue-500" />
                        <h4 className="text-white font-semibold text-lg">Giao hàng toàn quốc</h4>
                        <p className="text-sm text-gray-400">Miễn phí vận chuyển cho đơn hàng từ 5.000.000đ.</p>
                    </div>
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <CreditCard className="w-10 h-10 text-blue-500" />
                        <h4 className="text-white font-semibold text-lg">Thanh toán linh hoạt</h4>
                        <p className="text-sm text-gray-400">Hỗ trợ trả góp 0% qua thẻ tín dụng và công ty tài chính.</p>
                    </div>
                </div>
            </div>

            {/* 2. Phần Nội dung chính */}
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    
                    {/* Cột 1: Thông tin liên hệ */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-white mb-6">
                            <span className="text-blue-500">Tech</span>Store
                        </h3>
                        <p className="text-sm leading-relaxed mb-4">
                            Hệ thống bán lẻ các thiết bị điện tử, điện thoại, máy tính và phụ kiện công nghệ hàng đầu Việt Nam.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-start space-x-3">
                                <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">Tầng 3, Tòa nhà Tech, Cầu Giấy, Hà Nội</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Phone className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                <span className="text-sm">Hotline: <strong className="text-white">1900 8888</strong></span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                <span className="text-sm">cskh@techstore.vn</span>
                            </li>
                        </ul>
                    </div>

                    {/* Cột 2: Sản phẩm */}
                    <div>
                        <h4 className="text-white font-semibold text-lg mb-6">Sản Phẩm</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm hover:text-blue-400 transition-colors">Điện thoại iPhone</a></li>
                            <li><a href="#" className="text-sm hover:text-blue-400 transition-colors">Laptop / Macbook</a></li>
                            <li><a href="#" className="text-sm hover:text-blue-400 transition-colors">Máy tính bảng (Tablet)</a></li>
                            <li><a href="#" className="text-sm hover:text-blue-400 transition-colors">Phụ kiện công nghệ</a></li>
                            <li><a href="#" className="text-sm hover:text-blue-400 transition-colors">Đồng hồ thông minh</a></li>
                        </ul>
                    </div>

                    {/* Cột 3: Hỗ trợ khách hàng */}
                    <div>
                        <h4 className="text-white font-semibold text-lg mb-6">Hỗ Trợ Khách Hàng</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm hover:text-blue-400 transition-colors">Chính sách bảo hành</a></li>
                            <li><a href="#" className="text-sm hover:text-blue-400 transition-colors">Chính sách đổi trả 30 ngày</a></li>
                            <li><a href="#" className="text-sm hover:text-blue-400 transition-colors">Hướng dẫn mua trả góp</a></li>
                            <li><a href="#" className="text-sm hover:text-blue-400 transition-colors">Chính sách bảo mật thông tin</a></li>
                            <li><a href="#" className="text-sm hover:text-blue-400 transition-colors">Tra cứu đơn hàng</a></li>
                        </ul>
                    </div>

                    {/* Cột 4: Đăng ký nhận tin & Mạng xã hội */}
                    <div>
                        <h4 className="text-white font-semibold text-lg mb-6">Đăng Ký Nhận Tin</h4>
                        <p className="text-sm mb-4">Nhận ngay mã giảm giá 10% cho đơn hàng đầu tiên khi đăng ký bản tin của chúng tôi.</p>
                        <form className="flex mb-6">
                            <input 
                                type="email" 
                                placeholder="Nhập email của bạn..." 
                                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500 rounded-l-md"
                            />
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors rounded-r-md">
                                Gửi
                            </button>
                        </form>
                        
                        <h4 className="text-white font-semibold mb-4">Kết Nối Với Chúng Tôi</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-red-600 transition-colors">
                                <Youtube className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-400 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Phần Copyright */}
            <div className="container mx-auto px-4 mt-12 pt-8 border-t border-gray-800">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-gray-500 mb-4 md:mb-0">
                        &copy; {new Date().getFullYear()} TechStore. Tất cả các quyền được bảo lưu.
                    </p>
                    <div className="flex space-x-4">
                        {/* Chỗ này thường để logo Visa, Mastercard, Momo, VNPAY (Bạn có thể thay bằng thẻ img) */}
                        <div className="px-3 py-1 bg-gray-800 rounded text-xs font-bold text-gray-400">VISA</div>
                        <div className="px-3 py-1 bg-gray-800 rounded text-xs font-bold text-gray-400">MasterCard</div>
                        <div className="px-3 py-1 bg-gray-800 rounded text-xs font-bold text-gray-400">MoMo</div>
                        <div className="px-3 py-1 bg-gray-800 rounded text-xs font-bold text-gray-400">VNPAY</div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;