import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search} from 'lucide-react';
import { Spin } from 'antd';
import { ProductService } from '@/services/product.service';


const LOCAL_SUGGESTIONS = [
    { name: "iPhone 15 Pro Max", id: "local-1" },
    { name: "Macbook Air M2", id: "local-2" },
    { name: "Tai nghe Bluetooth", id: "local-3" },
    { name: "Bàn phím cơ", id: "local-4" },
];

const SmartSearchBar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [keyword, setKeyword] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const searchRef = useRef(null);
    const controllerRef = useRef(null);
    const cacheRef = useRef({}); 

    // Custom Hook: Xử lý click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Custom Hook: Xóa từ khóa khi chuyển sang trang khác không liên quan
    useEffect(() => {
        if (location.pathname !== '/products') {
            // 1. Nếu đi khỏi trang sản phẩm -> Dọn sạch ô input & đóng dropdown
            setKeyword('');
            setShowDropdown(false);
        } else {
            // 2. UX NÂNG CAO: Nếu user đang ở trang products và bấm nút Back/Forward 
            // của trình duyệt, ta sẽ đồng bộ ngược từ khóa từ URL vào lại ô input
            const params = new URLSearchParams(location.search);
            const urlKeyword = params.get('keyword') || '';
            setKeyword(urlKeyword);
        }
    }, [location.pathname, location.search]);

    // Logic fetch API với Debounce chuẩn
    useEffect(() => {
        const trimmed = keyword.trim();

        if (!trimmed) {
            setSuggestions(LOCAL_SUGGESTIONS);
            return;
        }

        const timer = setTimeout(async () => {
            if (cacheRef.current[trimmed]) {
                setSuggestions(cacheRef.current[trimmed]);
                return;
            }

            setIsSearching(true);
            if (controllerRef.current) controllerRef.current.abort();
            
            const controller = new AbortController();
            controllerRef.current = controller;

            try {
                const res = await ProductService.searchAndFilterProducts(
                    { keyword: trimmed, limit: 5 }, // Gợi ý thì chỉ nên limit 5
                    { signal: controller.signal }
                );
                const data = res.data?.data?.items || [];
                cacheRef.current[trimmed] = data; // Lưu vào RAM
                setSuggestions(data);
            } catch (error) {
                if (error.name !== "CanceledError") console.error("Lỗi search:", error);
            } finally {
                setIsSearching(false);
            }
        }, 400); // 400ms là con số vàng cho Debounce Search

        return () => clearTimeout(timer);
    }, [keyword]);

    // HÀM XỬ LÝ KHI BẤM CHUYỂN TRANG
    const executeSearch = (searchKey) => {
        const query = searchKey.trim();
        if (!query) return;

        setShowDropdown(false);
        setKeyword(query); // Đồng bộ lại ô input

        // Cách build param tối ưu không bị lặp code
        const params = new URLSearchParams(location.search);
        params.set('keyword', query);
        params.set('page', '1');
        navigate(`/products?${params.toString()}`);
    };

    const handleSuggestionClick = (item) => {
        if (item.slug) {
            // Nếu là sản phẩm từ API -> Chuyển đến trang chi tiết
            setShowDropdown(false);
            navigate(`/product/${item.slug}`);
        } else {
            // Nếu là Local Suggestion -> Đẩy lên thanh search
            executeSearch(item.name);
        }
    };

    return (
        <div ref={searchRef} className="relative w-full">
            <div className={`relative flex items-center bg-gray-100/80 border-2 transition-all shadow-sm 
                ${showDropdown ? 'border-blue-500 rounded-t-2xl bg-white' : 'border-transparent rounded-full hover:border-gray-200 focus-within:border-blue-500 focus-within:bg-white'}`}>

                <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                    className="w-full bg-transparent py-2.5 pl-5 pr-12 focus:outline-none text-[15px] font-medium placeholder-gray-400"
                    value={keyword}
                    onChange={(e) => {
                        setKeyword(e.target.value);
                        setShowDropdown(true);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && executeSearch(keyword)}
                    onFocus={() => setShowDropdown(true)}
                />

                <button
                    onClick={() => executeSearch(keyword)}
                    className="absolute right-1.5 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors"
                >
                    {isSearching ? <Spin size="small" className="text-white" /> : <Search className="w-4 h-4" />}
                </button>
            </div>

            {/* DROPDOWN KẾT QUẢ */}
            {showDropdown && (
                <div className="absolute top-full left-0 w-full bg-white border border-t-0 rounded-b-2xl shadow-xl z-50 overflow-hidden">
                    
                    {!keyword.trim() && (
                        <div className="px-4 py-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Xu hướng tìm kiếm
                        </div>
                    )}

                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                        {suggestions.length > 0 ? (
                            suggestions.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSuggestionClick(item)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-left border-b border-gray-50 last:border-0 group"
                                >
                                    {item.thumbnail ? (
                                        <img src={item.thumbnail} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                                    ) : (
                                        <Search className="w-4 h-4 text-gray-400 group-hover:text-blue-500 shrink-0" />
                                    )}
                                    
                                    <span className={`text-[14px] line-clamp-2 ${item.slug ? 'font-medium text-gray-700' : 'text-gray-600'}`}>
                                        {item.name}
                                    </span>
                                </button>
                            ))
                        ) : (
                            !isSearching && (
                                <div className="p-6 text-center text-gray-500 text-sm">
                                    Không tìm thấy sản phẩm nào khớp với "{keyword}"
                                </div>
                            )
                        )}
                    </div>

                    {/* Nút Xem Tất Cả (Chỉ hiện khi có nhập từ khóa và có kết quả) */}
                    {keyword.trim() && suggestions.length > 0 && (
                        <div className="p-2 border-t border-gray-100 bg-gray-50/50">
                            <button
                                onClick={() => executeSearch(keyword)}
                                className="w-full py-2 text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                Xem tất cả kết quả cho "{keyword}"
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SmartSearchBar;