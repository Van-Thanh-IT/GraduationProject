import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Spin, Popconfirm, Checkbox } from 'antd';
import { 
  DeleteOutlined, 
  ShoppingCartOutlined, 
  SafetyCertificateFilled,
  MinusOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useGetCart, useDeleteCartItem, useUpdateCartQuantity } from '@/hooks/useCart'; 
import { useNavigate, Link } from 'react-router-dom';
import { formatCurrency } from '@/utils/format';
import { useCountdown } from '@/hooks/useCountdown';
import { toast } from 'react-toastify';
import SEO from '@/components/SEO';
import { Helmet } from 'react-helmet-async';

const CartCountdown = ({ endTime }) => {
  const { hours, minutes, seconds } = useCountdown(endTime);

  return (
    <div className="flex items-center gap-1 mt-1 text-red-500">
      <span className="text-[11px] font-medium">Kết thúc:</span>
      <div className="flex items-center gap-0.5">
        <span className="bg-red-50 text-red-600 px-1 rounded font-mono text-[11px] font-bold">{hours}</span>
        <span className="text-red-500 font-bold text-[10px]">:</span>
        <span className="bg-red-50 text-red-600 px-1 rounded font-mono text-[11px] font-bold">{minutes}</span>
        <span className="text-red-500 font-bold text-[10px]">:</span>
        <span className="bg-red-50 text-red-600 px-1 rounded font-mono text-[11px] font-bold">{seconds}</span>
      </div>
    </div>
  );
};

const CartPage = () => {
  const navigate = useNavigate();
  const { data: cartData, isLoading } = useGetCart();
  const { mutate: deleteItem } = useDeleteCartItem();
  const { mutate: updateQuantity } = useUpdateCartQuantity();

  const [selectedItems, setSelectedItems] = useState([]);
  
  const [localQuantities, setLocalQuantities] = useState({});
  const updateTimers = useRef({}); 

  const cartItems = useMemo(() => {
    if (!cartData?.items) return [];
    return [...cartData.items].sort((a, b) => Number(a.itemId) - Number(b.itemId));
  }, [JSON.stringify(cartData?.items)]);

  useEffect(() => {
    if (!cartItems.length) return;
    const newQuantities = { ...localQuantities };
    let hasChanges = false;
    
    cartItems.forEach(item => {
        if (!updateTimers.current[item.itemId] && newQuantities[item.itemId] !== item.quantity) {
            newQuantities[item.itemId] = item.quantity;
            hasChanges = true;
        }
    });
    
    if (hasChanges) setLocalQuantities(newQuantities);
  }, [cartItems]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(cartItems.map(item => item.itemId));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const selectedTotal = useMemo(() => {
    return cartItems
      .filter(item => selectedItems.includes(item.itemId))
      .reduce((total, item) => {
          const displayQuantity = localQuantities[item.itemId] || item.quantity;
          const unitPrice = item.subTotal / item.quantity; // Đảm bảo lấy đúng đơn giá
          return total + (unitPrice * displayQuantity);
      }, 0); 
  }, [cartItems, selectedItems, localQuantities]);

  const handleQuantityChange = (cartItem, change, actualMax) => {
    const currentQ = localQuantities[cartItem.itemId] || cartItem.quantity;
    const newQuantity = currentQ + change;
    
    if (newQuantity > actualMax || newQuantity < 1) return;

    setLocalQuantities(prev => ({ ...prev, [cartItem.itemId]: newQuantity }));

    if (updateTimers.current[cartItem.itemId]) {
        clearTimeout(updateTimers.current[cartItem.itemId]);
    }

    updateTimers.current[cartItem.itemId] = setTimeout(() => {
        updateQuantity({ cartItemId: cartItem.itemId, quantity: newQuantity });
        delete updateTimers.current[cartItem.itemId];
    }, 500);
  };
  
  const handleCheckout = () => {
      if (selectedItems.length === 0) {
          toast.error("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!");
          return;
      }
      navigate('/checkout', { state: { selectedItems } });
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center bg-gray-50">
        <Spin />
        <span className="mt-2 text-gray-400 text-xs font-medium">Đang tải giỏ hàng...</span>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <>
        <SEO
          title="Giỏ hàng "
          description="Xem lại các sản phẩm bạn đã thêm vào giỏ hàng và tiến hành thanh toán nhanh chóng tại TechStore."
          url="/cart"
        />
        
        <div className="min-h-[60vh] bg-gray-50 py-12 flex flex-col items-center justify-center font-sans">
          <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center border border-gray-100 mb-6">
            <img src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png" alt="Empty Cart" className="w-24 h-24 opacity-40" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Giỏ hàng của bạn đang trống</h2>
          <p className="text-gray-400 mb-6 text-sm text-center max-w-sm">Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
          <button 
            onClick={() => navigate('/')} 
            className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            MUA SẮM NGAY
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Giỏ hàng" noIndex/>

      <div className="bg-gray-50 min-h-screen py-4 md:py-6 font-sans">
        <div className="max-w-[1200px] lg:max-w-[1300px] mx-auto px-4 md:px-6">
          
          <div className="flex items-end justify-between mb-4">
            <h1 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2 m-0 uppercase tracking-wide">
              <ShoppingCartOutlined className="text-blue-600 text-xl" /> 
              Giỏ hàng của bạn 
              <span className="text-xs text-gray-400 bg-gray-200/60 px-2 py-0.5 rounded font-bold ml-1">
                {cartItems.length}
              </span>
            </h1>
          </div>

          <div className="flex flex-col lg:flex-row gap-5 items-start">
            
            <div className="w-full lg:flex-1 flex flex-col gap-3">
              <div className="hidden md:flex items-center px-4 py-2.5 bg-white rounded-lg border border-gray-200 text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                <div className="w-[5%] flex justify-center">
                    <Checkbox 
                      checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                      onChange={handleSelectAll}
                    />
                </div>
                <div className="w-[45%]">Sản phẩm ({selectedItems.length} đang chọn)</div>
                <div className="w-[15%] text-center">Đơn giá</div>
                <div className="w-[18%] text-center">Số lượng</div>
                <div className="w-[17%] text-right">Thành tiền</div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
                {cartItems.map((item, index) => {
                  const isFlashSale = !!item.flashSale; 
                  const stockLimit = isFlashSale ? item.flashSale.saleStockRemaining : item.maxStock;
                  const actualMax = Math.min(stockLimit, 99);
                  
                  // Sử dụng displayQuantity nội bộ để hiện số tức thì thay vì chờ API
                  const displayQuantity = localQuantities[item.itemId] || item.quantity;
                  const unitPrice = item.subTotal / item.quantity; 

                  let limitMessage = "";
                  if (displayQuantity >= actualMax) {
                      limitMessage = actualMax >= 99 ? "Tối đa 99 sản phẩm" : `Kho còn ${actualMax} sản phẩm`;
                  }

                  return (
                    <div key={item.itemId} className={`p-4 flex flex-col md:flex-row items-start md:items-center gap-4 relative group transition-colors hover:bg-gray-50/40 ${index !== 0 ? 'border-t border-gray-100' : ''}`}>
                      <div className="hidden md:flex w-[5%] justify-center">
                          <Checkbox 
                            checked={selectedItems.includes(item.itemId)}
                            onChange={(e) => handleSelectItem(item.itemId, e.target.checked)}
                          />
                      </div>

                      <div className="w-full md:w-[45%] flex gap-3">
                          <div className="md:hidden pt-7">
                              <Checkbox checked={selectedItems.includes(item.itemId)} onChange={(e) => handleSelectItem(item.itemId, e.target.checked)} />
                          </div>
                          <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-lg border border-gray-100 bg-white p-1.5 overflow-hidden relative flex items-center justify-center">
                            <img src={item.imageUrl} alt={item.productName} className="max-w-full max-h-full object-contain" />
                            {isFlashSale && (
                              <span className="absolute top-1 left-1 bg-orange-500 text-white text-[9px] font-bold px-1 rounded">
                                ⚡ Sale
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col justify-center min-w-0">
                            <Link to={`/product/${item.productSlug || item.itemId}`} className="text-[14px] font-semibold text-gray-800 hover:text-blue-600 line-clamp-2 transition-colors leading-snug">
                              {item.productName}
                            </Link>
                            
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                              <span className="px-2 py-0.5 bg-gray-50 border border-gray-200/60 rounded text-gray-500 text-[11px] font-medium">
                                {item.options}
                              </span>
                              {isFlashSale && (
                                <span className="px-1.5 py-0.5 bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold uppercase rounded">
                                  Deal Sốc
                                </span>
                              )}
                            </div>
                            
                            {isFlashSale && item.flashSale.endTime && (
                                <CartCountdown endTime={item.flashSale.endTime} />
                            )}
                          </div>
                      </div>

                      <div className="hidden md:block md:w-[15%] text-center text-[14px] font-medium text-gray-500">
                          {formatCurrency(unitPrice)}
                      </div>

                      {/* CỘT SỐ LƯỢNG ĐÃ ĐƯỢC LÀM LẠI LAYOUT CHỐNG ĐÈ CHỮ */}
                      <div className="w-full md:w-[18%] flex flex-col md:justify-center mt-2 md:mt-0 pl-7 md:pl-0">
                          <div className="flex justify-between md:justify-center items-center w-full">
                              <div className="md:hidden text-[12px] text-gray-400 font-medium">Số lượng:</div>
                              
                              {/* Loại bỏ trạng thái pointer-events-none để không bị khựng nút */}
                              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md p-0.5">
                                <button
                                  type="button"
                                  disabled={displayQuantity <= 1}
                                  onClick={() => handleQuantityChange(item, -1, actualMax)}
                                  className="w-7 h-7 rounded flex items-center justify-center text-gray-500 hover:bg-white hover:text-blue-600 disabled:opacity-20 transition-all"
                                >
                                  <MinusOutlined className="text-[9px]" />
                                </button>
                                <span className="w-8 text-center text-[13px] font-bold text-gray-800">
                                  {displayQuantity}
                                </span>
                                <button 
                                  type="button"
                                  disabled={displayQuantity >= actualMax}
                                  onClick={() => handleQuantityChange(item, 1, actualMax)}
                                  className="w-7 h-7 rounded flex items-center justify-center text-gray-500 hover:bg-white hover:text-blue-600 disabled:opacity-20 transition-all"
                                >
                                  <PlusOutlined className="text-[9px]" />
                                </button>
                              </div>
                          </div>
                          
                          {/* Dòng chữ không còn absolute nên sẽ không bao giờ bị đè vào nút */}
                          {limitMessage && (
                              <div className="w-full text-right md:text-center mt-1.5">
                                  <span className="text-[10px] text-red-500 font-medium leading-none inline-block">
                                    {limitMessage}
                                  </span>
                              </div>
                          )}
                      </div>

                      <div className="w-full md:w-[17%] flex justify-between md:justify-end items-center pl-7 md:pl-0 mt-1 md:mt-0">
                          <div className="md:hidden text-[12px] text-gray-400 font-medium">Tạm tính:</div>
                          <div className={`text-[15px] font-bold ${isFlashSale ? 'text-orange-600' : 'text-red-600'}`}>
                            {/* Tính toán hiển thị ngay tiền phụ thuộc số lượng ảo */}
                            {formatCurrency(unitPrice * displayQuantity)}
                          </div>
                      </div>

                      <div className="absolute top-3 right-3 flex justify-end">
                          <Popconfirm
                            title="Xóa khỏi giỏ hàng?"
                            onConfirm={() => deleteItem(item.itemId)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                          >
                            <button type="button" className="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-gray-50 transition-colors">
                                <DeleteOutlined className="text-[15px]" />
                            </button>
                          </Popconfirm>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="w-full lg:w-[280px] shrink-0 sticky top-32" style={{ top: "calc(var(--header-height) + 16px)" }}>
              <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col gap-4">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-gray-800">Tổng tiền chọn</span>
                      <span className="text-[11px] text-gray-400">({selectedItems.length} sản phẩm)</span>
                    </div>
                    <span className="text-xl font-bold text-red-600">{formatCurrency(selectedTotal)}</span>
                  </div>

                  <button 
                    type="button"
                    onClick={handleCheckout}
                    disabled={selectedItems.length === 0}
                    className="w-full h-11 bg-red-500 text-white text-[14px] font-bold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 uppercase tracking-wide"
                  >
                    Tiến hành đặt hàng
                  </button>

                  <div className="flex items-start gap-2 pt-3 border-t border-gray-100">
                    <SafetyCertificateFilled className="text-green-500 text-base mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-gray-700">Thanh toán an toàn</span>
                      <span className="text-[11px] text-gray-400 leading-normal">Bảo mật thông tin giao dịch tuyệt đối.</span>
                    </div>
                  </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;