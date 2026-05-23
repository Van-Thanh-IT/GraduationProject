import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, MonitorSmartphone, ShieldCheck } from 'lucide-react';
import { useGetCart } from '@/hooks/useCart';
import { useAuth } from '@/context/AuthContext';
import SmartSearchBar from './SmartSearchBar';

const navLinks = [
    { path: '/', label: 'Trang chủ' },
    { path: '/products', label: 'Sản phẩm' },
    { path: '/abouts', label: 'Giới thiệu' },
    { path: '/articles', label: 'Tin tức' },
    { path: '/warranty', label: 'Tra cứu bảo hành' },
];

const Header = () => {
    const location = useLocation();
    const { data: cartData } = useGetCart();
    const { user, isAuthenticated, logoutContext } = useAuth();

    
    
    const cartItemsCount = cartData?.items?.length || 0;
    const userRoles = (user?.roles || []).map(r => r.name || r);
    const hasAdminAccess = userRoles.includes("ADMIN") || userRoles.includes("STAFF");

    // Hàm kiểm tra link đang active
    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const [showHeader, setShowHeader] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // scroll xuống -> ẩn header
            if (currentScrollY > lastScrollY && currentScrollY > 80) {
                setShowHeader(false);
            } 
            // scroll lên -> hiện header
            else {
                setShowHeader(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    useEffect(() => {
        const height = showHeader ? 120 : 0;

        document.documentElement.style.setProperty(
            "--header-height",
            `${height}px`
        );
    }, [showHeader]);
    

    return (
        <header className={`bg-white shadow-sm sticky top-0 z-50 font-sans transition-transform duration-300
        ${showHeader ? "translate-y-0" : "-translate-y-full"}`}>
            <div className="bg-blue-600 text-white text-xs py-1.5 text-center font-medium">
                Khuyến mãi khai trương: Giảm giá lên đến 50% cho các dòng iPhone & Laptop!
            </div>

            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group shrink-0">
                    <MonitorSmartphone className="w-8 h-8 text-blue-600 transition-transform group-hover:scale-105" />
                    <span className="text-2xl font-black tracking-tight text-gray-900 hidden sm:block">
                        Tech<span className="text-blue-600">Store</span>
                    </span>
                </Link>

                <div className="flex-1 max-w-2xl mx-4 sm:mx-10 relative z-50">
                    <SmartSearchBar />
                </div>

                <div className="flex items-center gap-5 md:gap-7 shrink-0">
                    <Link to="/cart" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors relative">
                        <ShoppingCart className="w-6 h-6" />
                        {cartItemsCount > 0 && (
                            <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                                {cartItemsCount}
                            </span>
                        )}
                    </Link>

                    {isAuthenticated ? (
                        <div className="relative group cursor-pointer">
                            <div className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
                                <div className="bg-gray-100 p-1.5 rounded-full overflow-hidden">
                                    {user.avatar ? (
                                        <img src={user.avatar} className="w-6 h-6 object-cover" alt="avatar" />
                                    ) : (
                                        <User className="w-5 h-5" />
                                    )}
                                </div>
                                <span className="hidden lg:block font-bold text-[15px] max-w-[120px] truncate">
                                    {user?.username || 'Tài khoản'}
                                </span>
                            </div>

                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
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
                                        <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
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
                        <Link to="/login" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                            <User className="w-5 h-5" />
                            <span>Tài khoản</span>
                        </Link>
                    )}
                </div>
            </div>

            <nav className="hidden md:block border-t border-gray-100 bg-white">
                <div className="container mx-auto px-4 flex gap-8">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.path} 
                            to={link.path} 
                            className={`py-3 text-[14px] font-bold border-b-2 transition-colors ${
                                isActive(link.path) 
                                ? "text-blue-600 border-blue-600" 
                                : "text-gray-600 border-transparent hover:text-blue-600"
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </nav>
        </header>
    );
};

export default Header;