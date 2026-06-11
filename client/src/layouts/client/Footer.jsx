// File: src/components/Footer.jsx
import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, CreditCard, ShieldCheck, Truck, MessageCircle } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 pt-10 pb-6 border-t border-gray-800 font-sans">
            
            {/* CÁC CHÍNH SÁCH NỔI BẬT */}
            <div className="container mx-auto px-4 mb-8 border-b border-gray-800 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="flex flex-col items-center justify-center space-y-1.5">
                        <ShieldCheck className="w-8 h-8 text-blue-500" />
                        <h4 className="text-white font-bold text-sm uppercase tracking-wide">Bảo hành chính hãng</h4>
                    </div>
                    <div className="flex flex-col items-center justify-center space-y-1.5">
                        <Truck className="w-8 h-8 text-blue-500" />
                        <h4 className="text-white font-bold text-sm uppercase tracking-wide">Giao hàng toàn quốc</h4>
                    </div>
                    <div className="flex flex-col items-center justify-center space-y-1.5">
                        <CreditCard className="w-8 h-8 text-blue-500" />
                        <h4 className="text-white font-bold text-sm uppercase tracking-wide">Thanh toán linh hoạt</h4>
                    </div>
                </div>
            </div>

            {/* NỘI DUNG CHÍNH CHIA 4 CỘT */}
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
                    
                    {/* CỘT 1: THÔNG TIN (Chiếm 1 cột) */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-white m-0">
                            <span className="text-blue-500">Tech</span>Store
                        </h3>
                        <ul className="space-y-3 p-0 m-0 list-none">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                                <span className="text-sm text-gray-400">Tầng 3, Tòa nhà Tech, Cầu Giấy, Hà Nội</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                                <span className="text-sm text-gray-400">Hotline: <strong className="text-white">1900 8888</strong></span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                                <span className="text-sm text-gray-400">cskh@techstore.vn</span>
                            </li>
                        </ul>
                        
                        {/* MẠNG XÃ HỘI */}
                        <div className="flex gap-3 pt-2">
                            <a href="https://www.facebook.com/van.thanh.598967" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors text-white"><Facebook className="w-5 h-5" /></a>
                            <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-500 transition-colors text-white"><MessageCircle className="w-5 h-5" /></a>
                            <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors text-white"><Instagram className="w-5 h-5" /></a>
                            <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-red-600 transition-colors text-white"><Youtube className="w-5 h-5" /></a>
                        </div>
                    </div>

                    {/* CỘT 2: SẢN PHẨM (Chiếm 1 cột) */}
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase tracking-wide mb-4">Sản Phẩm</h4>
                        <ul className="space-y-2.5 p-0 m-0 list-none">
                            <li><a href="/products?category=dien-thoai&page=1" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">Điện thoại</a></li>
                            <li><a href="/products?category=laptop&page=1" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">Laptop / Macbook</a></li>
                            <li><a href="/products?category=tablet&page=1" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">Máy tính bảng</a></li>
                            <li><a href="/products?category=phu-kien&page=1" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">Phụ kiện công nghệ</a></li>
                            <li><a href="/products?category=dong-ho&page=1" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">Đồng hồ thông minh</a></li>
                        </ul>
                    </div>

                    {/* CỘT 3 & 4: BẢN ĐỒ (Chiếm 2 cột) */}
                    <div className="lg:col-span-2">
                        <h4 className="text-white font-bold text-sm uppercase tracking-wide mb-4">Vị trí cửa hàng</h4>
                        <div className="bg-gray-800 p-1 rounded-lg border border-gray-700 h-[220px] w-full shadow-lg">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d930.9657409268152!2d105.77451720704842!3d21.03816848208359!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454c9d9e80ad1%3A0xa8834169e964c217!2zVHLGsOG7nW5nIEPDoW4gQuG7mSBRdeG6o24gTMO9IFbEg24gSG_DoSBUaMOqIFRoYW8gRHUgTOG7i2No!5e0!3m2!1svi!2s!4v1775656854538!5m2!1svi!2s" 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0, borderRadius: '0.375rem' }} 
                                allowFullScreen="" 
                                loading="lazy"
                                title="Google Map"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>

            {/* COPYRIGHT */}
            <div className="container mx-auto px-4 mt-10 pt-4 border-t border-gray-800 text-center">
                <p className="text-xs text-gray-600">
                    © {new Date().getFullYear()} TechStore. Tất cả các quyền được bảo lưu.
                </p>
            </div>
        </footer>
    );
};

export default Footer;