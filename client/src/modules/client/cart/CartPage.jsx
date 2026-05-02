import React, { useState, useMemo } from 'react';
import { Spin, Popconfirm, Checkbox, message } from 'antd';
import { 
  DeleteOutlined, 
  ShoppingCartOutlined, 
  SafetyCertificateFilled,
  MinusOutlined,
  PlusOutlined,
  ThunderboltFilled
} from '@ant-design/icons';
import { useGetCart, useDeleteCartItem, useUpdateCartQuantity } from '@/hooks/useCart'; 
import { useNavigate, Link } from 'react-router-dom';

// 1. IMPORT CÁC HÀM DÙNG CHUNG (TÁI SỬ DỤNG)
import { formatCurrency } from '@/utils/format';
import { useCountdown } from '@/hooks/useCountdown';

// ==========================================
// COMPONENT: ĐỒNG HỒ ĐẾM NGƯỢC MINI (ĐÃ DÙNG HOOK)
// ==========================================
const CartCountdown = ({ endTime }) => {
  // 2. GỌI HOOK SIÊU GỌN LẸ
  const { hours, minutes, seconds } = useCountdown(endTime);

  return (
    <div className="flex items-center gap-0.5 mt-1.5 mb-1">
      <span className="text-[10px] text-orange-500 font-bold mr-1">Kết thúc:</span>
      <span className="bg-orange-100 text-orange-600 px-1 rounded font-mono text-[9px] font-black">{hours}</span>
      <span className="text-orange-400 font-bold text-[9px]">:</span>
      <span className="bg-orange-100 text-orange-600 px-1 rounded font-mono text-[9px] font-black">{minutes}</span>
      <span className="text-orange-400 font-bold text-[9px]">:</span>
      <span className="bg-orange-100 text-orange-600 px-1 rounded font-mono text-[9px] font-black">{seconds}</span>
    </div>
  );
};

const CartPage = () => {
  const navigate = useNavigate();
  const { data: cartData, isLoading } = useGetCart();
  const { mutate: deleteItem } = useDeleteCartItem();
  const { mutate: updateQuantity, isLoading: isUpdating } = useUpdateCartQuantity();

  const cartItems = cartData?.items || [];


  // ==========================================
  // STATE LƯU CÁC SẢN PHẨM ĐƯỢC CHỌN (Chứa mảng các itemId)
  // ==========================================
  const [selectedItems, setSelectedItems] = useState([]);

  // ==========================================
  // LOGIC CHECKBOX
  // ==========================================
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(cartItems.map(item => item.itemId)); // Chọn tất cả
    } else {
      setSelectedItems([]); // Bỏ chọn tất cả
    }
  };

  const handleSelectItem = (itemId, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  // ==========================================
  // LOGIC TÍNH TỔNG TIỀN (Chỉ tính những món được tick)
  // ==========================================
  const selectedTotal = useMemo(() => {
    return cartItems
      .filter(item => selectedItems.includes(item.itemId))
      .reduce((total, item) => total + item.subTotal, 0); 
  }, [cartItems, selectedItems]);

  // ==========================================
  // LOGIC TĂNG/GIẢM SỐ LƯỢNG
  // ==========================================
  const handleQuantityChange = (cartItem, change) => {
    const newQuantity = cartItem.quantity + change;

    // Nếu là Flash Sale, kiểm tra giới hạn mua
    if (change > 0 && cartItem.flashSale) {
       if (cartItem.quantity >= cartItem.flashSale.maxQuantityPerUser) {
           message.warning(`Flash Sale chỉ cho phép mua tối đa ${cartItem.flashSale.maxQuantityPerUser} sản phẩm!`);
           return;
       }
       if (cartItem.quantity >= cartItem.flashSale.saleStockRemaining) {
           message.warning("Đã đạt giới hạn tồn kho của deal Flash Sale này!");
           return;
       }
    }
    
    updateQuantity({ cartItemId: cartItem.itemId, quantity: newQuantity });
  };
  
  const handleCheckout = () => {
      if (selectedItems.length === 0) {
          message.error("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!");
          return;
      }
      navigate('/checkout', { state: { selectedItems } });
  }

  if (isLoading) {
    return <div className="min-h-[60vh] flex flex-col justify-center items-center bg-[#f5f5fa]"><Spin size="large" /><span className="mt-4 text-slate-500 font-medium">Đang tải giỏ hàng...</span></div>;
  }

  if (!cartItems.length) {
    return (
      <div className="min-h-[70vh] bg-[#f5f5fa] py-12 flex flex-col items-center justify-center">
        <div className="w-64 h-64 bg-white rounded-full shadow-sm flex items-center justify-center mb-8">
          <img src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png" alt="Empty Cart" className="w-32 h-32 opacity-50" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Giỏ hàng của bạn đang trống</h2>
        <p className="text-slate-500 mb-8 text-center max-w-md">Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
        <button onClick={() => navigate('/')} className="px-10 py-4 bg-indigo-600 text-white text-[15px] font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all">
           MUA SẮM NGAY
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5fa] min-h-screen py-8 md:py-12 font-sans">
      <div className="max-w-[1200px] lg:max-w-[1300px] mx-auto px-4 md:px-6">
        
        {/* HEADER */}
        <div className="flex items-end justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3 m-0 tracking-tight">
            <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-2xl">
              <ShoppingCartOutlined /> 
            </div>
            Giỏ hàng của bạn 
            <span className="text-lg text-slate-500 font-medium bg-slate-200/50 px-3 py-1 rounded-xl ml-2">
              {cartItems.length}
            </span>
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
          <div className="w-full lg:w-[68%] flex flex-col gap-4">
            
            <div className="hidden md:flex items-center px-6 py-4 bg-white rounded-2xl shadow-sm border border-slate-100 text-[13px] font-black text-slate-400 uppercase tracking-wider">
               <div className="w-[5%] flex justify-center">
                  <Checkbox 
                     checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                     onChange={handleSelectAll}
                  />
               </div>
               <div className="w-[40%]">Sản phẩm ({selectedItems.length} đang chọn)</div>
               <div className="w-[15%] text-center">Đơn giá</div>
               <div className="w-[18%] text-center">Số lượng</div>
               <div className="w-[17%] text-right">Thành tiền</div>
               <div className="w-[5%] text-right"></div>
            </div>

            {/* Danh sách Items */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
               {cartItems.map((item, index) => {
                 const isFlashSale = item.flashSale !== null && item.flashSale !== undefined; 

                 return (
                  <div key={item.itemId} className={`p-4 md:px-6 md:py-6 flex flex-col md:flex-row items-start md:items-center gap-4 relative group transition-colors hover:bg-slate-50/50 ${index !== 0 ? 'border-t border-slate-100' : ''}`}>
                     
                     {/* Checkbox cho Từng sản phẩm */}
                     <div className="hidden md:flex w-[5%] justify-center">
                        <Checkbox 
                           checked={selectedItems.includes(item.itemId)}
                           onChange={(e) => handleSelectItem(item.itemId, e.target.checked)}
                        />
                     </div>

                     {/* Hình ảnh & Tên */}
                     <div className="w-full md:w-[40%] flex gap-4">
                        <div className="md:hidden pt-8">
                             <Checkbox checked={selectedItems.includes(item.itemId)} onChange={(e) => handleSelectItem(item.itemId, e.target.checked)} />
                        </div>
                        <div className="w-24 h-24 md:w-28 md:h-28 shrink-0 rounded-2xl border border-slate-100 bg-white p-2 overflow-hidden relative">
                           <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                           {/* Dấu sấm sét nhỏ đè lên ảnh nếu có FS */}
                           {isFlashSale && (
                             <div className="absolute top-1 right-1 bg-orange-500 text-white p-0.5 rounded-full shadow-sm">
                               <ThunderboltFilled className="text-[10px]" />
                             </div>
                           )}
                        </div>
                        <div className="flex flex-col justify-center pt-1">
                           <Link to={`/product/${item.productSlug || item.itemId}`} className="text-[15px] md:text-[16px] font-bold text-slate-800 hover:text-indigo-600 line-clamp-2 transition-colors leading-snug">
                             {item.productName}
                           </Link>
                           
                           <div className="mt-2.5 flex flex-wrap items-center gap-2">
                             <span className="px-3 py-1 bg-slate-100/80 border border-slate-200/60 rounded-lg text-slate-600 text-[12px] font-bold">
                               {item.options}
                             </span>
                             {/* TAG FLASH SALE CỰC ĐẸP */}
                             {isFlashSale && (
                               <span className="px-2 py-1 bg-orange-50 border border-orange-200 text-orange-600 text-[10px] font-black uppercase rounded-lg flex items-center gap-1 tracking-wider">
                                 <ThunderboltFilled /> Deal Sốc
                               </span>
                             )}
                           </div>
                           
                           {/* HIỂN THỊ ĐỒNG HỒ ĐẾM NGƯỢC NẾU CÓ FLASH SALE */}
                           {isFlashSale && item.flashSale.endTime && (
                              <CartCountdown endTime={item.flashSale.endTime} />
                           )}
                           
                        </div>
                     </div>

                     {/* Đơn Giá (Dùng hàm formatCurrency mới) */}
                     <div className={`hidden md:block md:w-[15%] text-center text-[15px] font-bold ${isFlashSale ? 'text-orange-600' : 'text-slate-500'}`}>
                        {formatCurrency(item.price)}
                     </div>

                     {/* Nút Tăng Giảm Số Lượng */}
                     <div className="w-full md:w-[18%] flex justify-between md:justify-center items-center mt-2 md:mt-0 pl-8 md:pl-0 relative flex-col gap-1">
                        <div className="md:hidden text-[13px] text-slate-500 font-bold w-full text-left">Số lượng:</div>
                        <div className={`flex items-center bg-slate-100/80 border border-slate-200/80 rounded-xl p-1 ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
                           <button
                             className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
                           >
                             <MinusOutlined className="text-[10px]" />
                           </button>
                           <span className="w-10 text-center text-[14px] font-black text-slate-800">
                             {item.quantity}
                           </span>
                           <button 
                             disabled={item.quantity >= item.maxStock}
                             onClick={() => handleQuantityChange(item, 1)}
                             className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all disabled:opacity-30"
                           >
                             <PlusOutlined className="text-[10px]" />
                           </button>
                        </div>
                        {/* Hiện cảnh báo giới hạn mua của Flash Sale nếu đã đạt max */}
                        {isFlashSale && item.quantity >= item.maxStock && (
                          <span className="text-[10px] text-rose-500 font-semibold absolute -bottom-4">Giới hạn {item.maxStock} SP</span>
                        )}
                     </div>

                     {/* Thành Tiền (Dùng hàm formatCurrency mới) */}
                     <div className="w-full md:w-[17%] flex justify-between md:justify-end items-center pl-8 md:pl-0">
                        <div className="md:hidden text-[13px] text-slate-500 font-bold">Tạm tính:</div>
                        <div className={`text-[16px] md:text-[17px] font-black ${isFlashSale ? 'text-orange-600' : 'text-rose-600'}`}>
                           {formatCurrency(item.subTotal)}
                        </div>
                     </div>

                     {/* Nút Xóa */}
                     <div className="absolute top-4 right-4 md:static md:w-[5%] flex justify-end">
                        <Popconfirm
                           title="Xóa khỏi giỏ hàng?"
                           onConfirm={() => deleteItem(item.itemId)}
                           okText="Xóa"
                           cancelText="Hủy"
                           okButtonProps={{ danger: true, className: "font-bold rounded-lg" }}
                           cancelButtonProps={{ className: "font-bold rounded-lg border-none bg-slate-100" }}
                        >
                           <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                              <DeleteOutlined className="text-[17px]" />
                           </button>
                        </Popconfirm>
                     </div>
                     
                  </div>
                 );
               })}
            </div>
          </div>

          {/* CỘT PHẢI: BILL THANH TOÁN (STICKY) */}
          <div className="w-full lg:w-[32%] shrink-0 sticky top-24">
             <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-6">
                <div className="flex justify-between items-end pt-2">
                   <div className="flex flex-col">
                     <span className="text-[16px] font-black text-slate-800">Tổng thanh toán</span>
                     <span className="text-[12px] text-slate-400 mt-1">({selectedItems.length} sản phẩm)</span>
                   </div>
                   {/* Dùng hàm formatCurrency mới */}
                   <span className="text-3xl font-black text-rose-600">{formatCurrency(selectedTotal)}</span>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                  className="w-full h-16 mt-2 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[16px] font-black rounded-2xl shadow-xl shadow-rose-200 hover:from-rose-600 hover:to-red-700 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                   TIẾN HÀNH ĐẶT HÀNG
                </button>

                <div className="flex items-start gap-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                   <SafetyCertificateFilled className="text-emerald-500 text-2xl" />
                   <div className="flex flex-col">
                     <span className="text-[13px] font-bold text-emerald-800">Thanh toán an toàn 100%</span>
                     <span className="text-[12px] text-emerald-600/80 font-medium">Bảo mật thông tin giao dịch chuẩn quốc tế.</span>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CartPage;