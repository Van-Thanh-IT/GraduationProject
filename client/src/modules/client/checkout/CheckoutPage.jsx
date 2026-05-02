// File: src/modules/client/checkout/CheckoutPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import { toast } from 'react-toastify';
import { SafetyCertificateFilled } from '@ant-design/icons';

import { useGetCart } from '@/hooks/useCart';
import { useGetCities, useGetDistricts, useGetWards, useCalculateFee } from '@/hooks/useGoship';
import { usePlaceOrder } from '@/hooks/useOrders';

import CheckoutLeftForm from './components/CheckoutLeftForm';
import CheckoutRightSummary from './components/CheckoutRightSummary';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedItemIds = location.state?.selectedItems || [];

  const { data: cartData, isLoading: isLoadingCart } = useGetCart();
  
  const checkoutItems = useMemo(() => {
    if (!cartData?.items) return [];
    return cartData.items.filter(item => selectedItemIds.includes(item.itemId));
  }, [cartData, selectedItemIds]);

  const subTotal = useMemo(() => {
    return checkoutItems.reduce((total, item) => total + item.subTotal, 0);
  }, [checkoutItems]);

  const totalWeight = 250;

  const [address, setAddress] = useState({ 
    fullName: '', phone: '', 
    city: null, cityName: null,
    district: null, districtName: null,
    ward: null, wardName: null,
    detail: ''
  });
  
  const [note, setNote] = useState('');
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  
  const [paymentMethod, setPaymentMethod] = useState('COD'); 
  const [voucherDiscount, setVoucherDiscount] = useState(0); 
  const [voucherCode, setVoucherCode] = useState(''); 

  const [vatInfo, setVatInfo] = useState({
    isVatRequired: false,
    companyName: '', taxCode: '', companyAddress: '', companyEmail: ''
  });

  const { data: cities } = useGetCities();
  const { data: districts, isFetching: loadingDistricts } = useGetDistricts(address.city);
  const { data: wards, isFetching: loadingWards } = useGetWards(address.district);
  const { mutate: calculateFee, isLoading: isCalculating } = useCalculateFee();

  const { mutate: placeOrder, isLoading: isPlacingOrder } = usePlaceOrder();

  useEffect(() => {
    if (address.city && address.district && address.ward && subTotal > 0) {
      calculateFee(
        { city: address.city, district: address.district, ward: address.ward, cod: subTotal, amount: subTotal, weight: totalWeight },
        {
          onSuccess: (res) => {
            if (res.data?.code === 200) {
              const carriers = res.data?.data || [];
              if (carriers.length > 0) {
                setShippingOptions(carriers);
                setSelectedShipping([...carriers].sort((a, b) => a.total_fee - b.total_fee)[0]);
              } else {
                toast.error("Không có hãng vận chuyển nào nhận đơn hàng giá trị này!");
                setShippingOptions([]); setSelectedShipping(null);
              }
            } else {
              toast.error(res.data?.messages || "Lỗi lấy phí vận chuyển");
              setShippingOptions([]); setSelectedShipping(null);
            }
          },
          onError: () => {
            toast.error("Mất kết nối hệ thống vận chuyển");
            setShippingOptions([]); setSelectedShipping(null);
          }
        }
      );
    }
  }, [address.city, address.district, address.ward, subTotal]);

  useEffect(() => {
    if (!isLoadingCart && checkoutItems.length === 0) {
       toast.warning("Vui lòng chọn sản phẩm để thanh toán");
       navigate('/cart');
    }
  }, [isLoadingCart, checkoutItems, navigate]);

  const shippingFee = selectedShipping?.total_fee || null;
  const finalTotalAmount = Math.max(0, subTotal + (shippingFee || 0) - voucherDiscount);
  const isReadyToSubmit = selectedShipping !== null;

  const handlePlaceOrder = () => {
    if (!address.fullName || !address.phone || !address.detail) {
      toast.error("Vui lòng nhập đủ Họ tên, Số điện thoại và Địa chỉ chi tiết!");
      return;
    }

    if (vatInfo.isVatRequired && (!vatInfo.taxCode || !vatInfo.companyName || !vatInfo.companyEmail)) {
      toast.error("Vui lòng điền đủ thông tin xuất hóa đơn VAT!");
      return;
    }

    const payload = {    
      isVatRequired: vatInfo.isVatRequired,
      taxCode: vatInfo.isVatRequired ? vatInfo.taxCode : null,
      companyAddress: vatInfo.isVatRequired ? vatInfo.companyAddress : null,
      companyName: vatInfo.isVatRequired ? vatInfo.companyName : null,
      customerEmail: vatInfo.companyEmail || null, 

      customerName: address.fullName,
      customerPhone: address.phone,
      note: note || null,

      voucherCode: voucherCode || null,
      items: checkoutItems.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity,
        cartItemId: item.itemId
      })),

      paymentMethod: paymentMethod,

      addressId: null,

      goshipShipmentId:  selectedShipping?.id || null,
      shippingAddress: address.detail,
      shippingCity: address.cityName,
      shippingCityCode: address.city,
      shippingDistrict: address.districtName,
      shippingDistrictCode: address.district,
      shippingWard: address.wardName,
      shippingWardCode: address.ward
    };
  
    placeOrder(payload);
  };

  if (isLoadingCart) return <div className="min-h-screen flex justify-center items-center"><Spin size="large" /></div>;

  return (
    <div className="bg-[#f5f5fa] min-h-screen py-8 font-sans">
      <div className="max-w-[1200px] lg:max-w-[1250px] mx-auto px-4 md:px-6">
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3 mb-8 uppercase tracking-wide">
           <SafetyCertificateFilled className="text-indigo-600 text-3xl" /> Đặt hàng an toàn
        </h1>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="w-full lg:w-[65%]">
            <CheckoutLeftForm 
              address={address} setAddress={setAddress}
              cities={cities} districts={districts} wards={wards}
              loadingDistricts={loadingDistricts} loadingWards={loadingWards}
              shippingOptions={shippingOptions} 
              selectedShipping={selectedShipping} 
              setSelectedShipping={setSelectedShipping}
              isCalculatingShip={isCalculating}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              vatInfo={vatInfo}          
              setVatInfo={setVatInfo}
              note={note}
              setNote={setNote}
            />
          </div>

          <div className="w-full lg:w-[35%] shrink-0">
            <CheckoutRightSummary 
               checkoutItems={checkoutItems}
               subTotal={subTotal}
               shippingFee={shippingFee}
               totalAmount={finalTotalAmount}
               isReadyToSubmit={isReadyToSubmit}
               voucherDiscount={voucherDiscount}
               setVoucherDiscount={setVoucherDiscount}
               voucherCode={voucherCode}          
               setVoucherCode={setVoucherCode}    
               onPlaceOrder={handlePlaceOrder} 
               isPlacingOrder={isPlacingOrder} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}