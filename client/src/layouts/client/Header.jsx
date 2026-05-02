
import React from 'react';
import { Link} from 'react-router-dom';
import { ShoppingCart, User, MonitorSmartphone, ShieldCheck } from 'lucide-react';
import { useGetCart } from '@/hooks/useCart';
import { useAuth } from '@/context/AuthContext';
import SmartSearchBar from './SmartSearchBar';

const Header = () => {
    const { data: cartData } = useGetCart();
    const { user, isAuthenticated, logoutContext } = useAuth();
    const cartItemsCount = cartData?.items?.length || 0;

    // Kiểm tra xem user có phải nhân viên/admin không để hiện nút vào trang Quản trị
    const userRoles = (user?.roles || []).map(r => r.name || r);
    const hasAdminAccess = userRoles.includes("ADMIN") || userRoles.includes("STAFF");

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50 font-sans">
            <div className="bg-blue-600 text-white text-xs py-1.5 text-center font-medium">
                Khuyến mãi khai trương: Giảm giá lên đến 50% cho các dòng iPhone & Laptop!
            </div>

            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group shrink-0">
                    <MonitorSmartphone className="w-8 h-8 text-blue-600 transition-transform group-hover:scale-110" />
                    <span className="text-2xl font-black tracking-tight text-gray-900 hidden sm:block">
                        Tech<span className="text-blue-600">Store</span>
                    </span>
                </Link>

                {/* Ô TÌM KIẾM THÔNG MINH */}
                <div className="flex-1 max-w-2xl mx-4 sm:mx-10 relative z-50">
                    <SmartSearchBar />
                </div>

                {/* KHU VỰC GIỎ HÀNG VÀ TÀI KHOẢN */}
                <div className="flex items-center gap-5 md:gap-7 shrink-0">
                    
                    {/* Giỏ hàng */}
                    <Link to="/cart" className="flex items-center gap-2 group shrink-0 text-gray-700 hover:text-blue-600 transition-colors">
                        <div className="relative">
                            <ShoppingCart className="w-[26px] h-[26px] transition-transform group-hover:scale-110" />
                            {cartItemsCount > 0 && (
                                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm border border-white">
                                    {cartItemsCount}
                                </span>
                            )}
                        </div>
                    </Link>

                    {/* Tài khoản */}
                    {isAuthenticated ? (
                        <div className="relative group cursor-pointer">
                            <div className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
                                <div className="bg-gray-100 p-1.5 rounded-full">
                                    {user.avatar ? <img src={user.avatar} className='rounded-full object-cover w-7 h-7'/> : <User className="w-5 h-5" /> }
                                </div>
                                <span className="hidden lg:block font-bold text-[15px] max-w-[120px] truncate">
                                    {user?.username || 'Tài khoản'}
                                </span>
                            </div>

                            {/* Dropdown Menu */}
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden translate-y-2 group-hover:translate-y-0">
                                <div className="p-3 border-b border-gray-50 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-800 line-clamp-1">{user?.username}</span>
                                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mt-0.5 w-fit">
                                            {user?.roles?.[0]?.name || 'Khách hàng'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="p-2 space-y-0.5">
                                    {hasAdminAccess && (
                                        <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-100 rounded-lg transition-colors">
                                            <ShieldCheck className="w-4 h-4" /> Quản trị hệ thống
                                        </Link>
                                    )}
                                    <Link to="/user/profile" className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors">Trang cá nhân</Link>
                                    <Link to="/user/orders" className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors">Đơn hàng của tôi</Link>
                                    <Link to="/user/address" className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors">Sổ địa chỉ</Link>
                                </div>

                                <div className="p-2 border-t border-gray-50">
                                    <button onClick={logoutContext} className="w-full text-left px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        Đăng xuất
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center">
                            <Link to="/login" className="text-[14px] font-bold text-white bg-blue-600 px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all hover:-translate-y-0.5">
                                Tài khoản
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Menu Ngang Desktop */}
            <nav className="hidden md:block border-t border-gray-100 bg-white">
                <div className="container mx-auto px-4 flex gap-8">
                    <Link to="/" className="py-3 text-[14px] font-bold text-gray-600 hover:text-blue-600 transition-colors">Trang chủ</Link>
                    <Link to="/abouts" className="py-3 text-[14px] font-bold text-gray-600 hover:text-blue-600 transition-colors">Giới thiệu</Link>
                    <Link to="/products" className="py-3 text-[14px] font-bold text-gray-600 hover:text-blue-600 transition-colors">Sản phẩm</Link>
                    <Link to="/articles" className="py-3 text-[14px] font-bold text-gray-600 hover:text-blue-600 transition-colors">Tin tức</Link>
                    <Link to="/contact" className="py-3 text-[14px] font-bold text-gray-600 hover:text-blue-600 transition-colors">Liên hệ</Link>
                    <Link to="/warranty" className="py-3 text-[14px] font-bold text-gray-600 hover:text-blue-600 transition-colors">Tra cứu bảo hành</Link>
                </div>
            </nav>
        </header>
    );
};

export default Header;