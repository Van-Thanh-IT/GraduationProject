import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, MonitorSmartphone, ShieldCheck, Settings, Menu, X } from 'lucide-react';
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

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const [showHeader, setShowHeader] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    
    // State cho Menu Mobile & Menu User
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    
    const userMenuRef = useRef(null);

    // Click ra ngoài để đóng Menu User
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Ẩn/Hiện Header khi cuộn
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 80) {
                showHeader && setShowHeader(false);
                setIsUserMenuOpen(false); 
                setIsMobileMenuOpen(false); // Cuộn trang thì đóng luôn Menu mobile cho gọn
            } else {
                !showHeader && setShowHeader(true);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY, showHeader]);

    return (
        <header className={`bg-white shadow-sm sticky top-0 z-[100] font-sans transition-transform duration-300
        ${showHeader ? "translate-y-0" : "-translate-y-full"}`}>
            
            <div className="bg-blue-600 text-white text-xs py-1.5 px-2 text-center font-medium line-clamp-1">
                Khuyến mãi khai trương: Giảm giá lên đến 50% cho các dòng iPhone & Laptop!
            </div>

            <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-3 md:gap-5 relative">
                
                {/* NÚT TOGGLE MENU MOBILE */}
                <button 
                    className="md:hidden p-1.5 -ml-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6 text-red-500" /> : <Menu className="w-6 h-6" />}
                </button>

                {/* LOGO */}
                <Link to="/" className="flex items-center gap-1.5 md:gap-2 group shrink-0">
                    <MonitorSmartphone className="w-7 h-7 md:w-8 md:h-8 text-blue-600 transition-transform group-hover:scale-105" />
                    <span className="text-xl md:text-2xl font-black tracking-tight text-gray-900 hidden sm:block">
                        Tech<span className="text-blue-600">Store</span>
                    </span>
                </Link>

                <div className="hidden md:block flex-1 max-w-2xl mx-10 relative z-[105]">
                    <SmartSearchBar />
                </div>

                <div className="flex items-center gap-4 md:gap-7 shrink-0 ml-auto md:ml-0">
                    <Link to="/cart" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors relative">
                        <ShoppingCart className="w-[22px] h-[22px] md:w-6 md:h-6" />
                        {cartItemsCount > 0 && (
                            <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                                {cartItemsCount}
                            </span>
                        )}
                    </Link>

                    {isAuthenticated ? (
                        <div 
                            className="relative cursor-pointer" 
                            ref={userMenuRef}
                            onMouseEnter={() => setIsUserMenuOpen(true)}
                            onMouseLeave={() => setIsUserMenuOpen(false)}
                        >
                            <div 
                                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            >
                                <div className="bg-gray-100 p-1.5 rounded-full overflow-hidden border border-gray-200">
                                    {user.avatar ? (
                                        <img src={user.avatar} className="w-5 h-5 md:w-6 md:h-6 object-cover" alt="avatar" />
                                    ) : (
                                        <User className="w-4 h-4 md:w-5 md:h-5" />
                                    )}
                                </div>
                                <span className="hidden lg:block font-bold text-[15px] max-w-[120px] truncate">
                                    {user?.username || 'Tài khoản'}
                                </span>
                            </div>

                            {/* DROPDOWN USER MENU (PC + Mobile) */}
                            <div className={`absolute right-0 top-full mt-2 w-56 max-w-[90vw] bg-white rounded-xl shadow-xl border border-gray-100 transition-all z-[999] overflow-hidden origin-top-right
                                ${isUserMenuOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}
                            `}>
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
                                
                                <div className="p-2 space-y-0.5" onClick={() => setIsUserMenuOpen(false)}> 
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
                            <User className="w-[22px] h-[22px] md:w-5 md:h-5" />
                            <span className="hidden sm:inline">Tài khoản</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* SEARCH BAR MOBILE */}
            <div className="md:hidden px-4 pb-3">
                <SmartSearchBar />
            </div>

            {/* ========================================================= */}
            {/* MENU MOBILE FULL WIDTH SỔ XUỐNG (THAY THẾ CHO MENU TRƯỢT) */}
            {/* ========================================================= */}
            <div 
                className={`md:hidden absolute top-full left-0 w-full bg-white shadow-2xl border-t border-gray-100 origin-top transition-all duration-300 z-[999] overflow-hidden
                ${isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="flex flex-col p-2">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.path} 
                            to={link.path} 
                            onClick={() => setIsMobileMenuOpen(false)} // Bấm xong tự đóng
                            className={`px-4 py-3.5 text-[15px] font-bold rounded-xl transition-colors ${
                                isActive(link.path) 
                                    ? "text-blue-600 bg-blue-50" 
                                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    
                    {hasAdminAccess && (
                        <div className="px-4 py-3 mt-2 border-t border-gray-100">
                            <Link 
                                to="/admin" 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center justify-center gap-2 w-full text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 py-3 rounded-xl transition-all shadow-sm"
                            >
                                <Settings className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
                                Trang Quản trị hệ thống
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* MENU DESKTOP */}
            <nav className="hidden md:block border-t border-gray-100 bg-white relative z-[100]">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex gap-8">
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

                    {hasAdminAccess && (
                        <Link 
                            to="/admin" 
                            className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 shadow-sm hover:shadow animate-pulse"
                        >
                            <Settings className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                            Vào trang Quản trị
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;