// File: src/modules/client/checkout/components/CheckoutAddress.jsx
import React, { useState, useEffect } from 'react';
import { Select, Input, Spin } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import { MapPin } from 'lucide-react';
import { useGetMyAddresses } from '@/hooks/useAddress';

export default function CheckoutAddress({ 
  address, setAddress, 
  cities, districts, wards, 
  loadingDistricts, loadingWards,
  note, setNote
}) {
  const [touched, setTouched] = useState({});
  const [hasAutoFilled, setHasAutoFilled] = useState(false);

  const { data: myAddresses, isLoading: loadingAddresses } = useGetMyAddresses();

  useEffect(() => {
    if (myAddresses?.length > 0 && !hasAutoFilled) {
      const defaultAddr = myAddresses.find(a => a.isDefault) || myAddresses[0];
      
      setAddress({
        fullName: defaultAddr.fullName,
        phone: defaultAddr.phone,
        city: defaultAddr.cityCode,           
        cityName: defaultAddr.city,           
        district: defaultAddr.districtCode,
        districtName: defaultAddr.district,
        ward: defaultAddr.wardCode,
        wardName: defaultAddr.ward,
        detail: defaultAddr.addressDetail
      });
      
      setHasAutoFilled(true);
    }
  }, [myAddresses, hasAutoFilled, setAddress]);

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const errors = {
    fullName: touched.fullName && !address.fullName?.trim() ? 'Vui lòng nhập họ và tên' : '',
    phone: touched.phone && !address.phone?.trim() ? 'Vui lòng nhập số điện thoại' : 
           touched.phone && !/^(0[3|5|7|8|9])+([0-9]{8})$/.test(address.phone?.trim()) ? 'Số điện thoại không hợp lệ' : '',
    city: touched.city && !address.city ? 'Vui lòng chọn Tỉnh / Thành' : '',
    district: touched.district && !address.district ? 'Vui lòng chọn Quận / Huyện' : '',
    ward: touched.ward && !address.ward ? 'Vui lòng chọn Phường / Xã' : '',
    detail: touched.detail && !address.detail?.trim() ? 'Vui lòng nhập địa chỉ cụ thể' : '',
  };

  // =========================================================================
  // FIX LỖI HIỂN THỊ SỐ: Tạo Option ảo tạm thời trong lúc chờ API Load
  // =========================================================================
  const cityOptions = cities?.map(c => ({ value: c.id, label: c.name })) || [];
  if (address.city && !cityOptions.some(o => o.value === address.city)) {
    cityOptions.push({ value: address.city, label: address.cityName || address.city });
  }

  const districtOptions = districts?.map(d => ({ value: d.id, label: d.name })) || [];
  if (address.district && !districtOptions.some(o => o.value === address.district)) {
    districtOptions.push({ value: address.district, label: address.districtName || address.district });
  }

  const wardOptions = wards?.map(w => ({ value: w.id, label: w.name })) || [];
  if (address.ward && !wardOptions.some(o => o.value === address.ward)) {
    wardOptions.push({ value: address.ward, label: address.wardName || address.ward });
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative">
       
       {loadingAddresses && (
         <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-3xl">
           <Spin size="large" />
         </div>
       )}

       <div className="flex items-center justify-between mb-5">
         <h3 className="text-[16px] font-black text-slate-800 flex items-center gap-2">
           <ShopOutlined className="text-indigo-500" /> 1. Địa chỉ giao hàng
         </h3>
         {hasAutoFilled && (
           <span className="flex items-center gap-1 text-[12px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
             <MapPin size={14} /> Đang dùng địa chỉ mặc định
           </span>
         )}
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <Input 
              placeholder="Họ và tên người nhận" 
              size="large" 
              className="rounded-xl h-12 font-medium"
              status={errors.fullName ? 'error' : ''}
              value={address.fullName} 
              onBlur={() => handleBlur('fullName')}
              onChange={(e) => setAddress({...address, fullName: e.target.value})} 
            />
            {errors.fullName && <span className="text-rose-500 text-[11px] font-semibold mt-1 pl-1">{errors.fullName}</span>}
          </div>
          
          <div className="flex flex-col">
            <Input 
              placeholder="Số điện thoại" 
              size="large" 
              className="rounded-xl h-12 font-medium"
              status={errors.phone ? 'error' : ''}
              value={address.phone} 
              onBlur={() => handleBlur('phone')}
              onChange={(e) => setAddress({...address, phone: e.target.value})} 
            />
            {errors.phone && <span className="text-rose-500 text-[11px] font-semibold mt-1 pl-1">{errors.phone}</span>}
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col">
            <Select 
              showSearch 
              placeholder="Chọn Tỉnh / Thành" 
              size="large" 
              className="w-full custom-checkout-select"
              status={errors.city ? 'error' : ''}
              value={address.city}
              options={cityOptions} // Đã dùng mảng option an toàn
              onBlur={() => handleBlur('city')}
              onChange={(val, option) => {
                setAddress({ 
                  ...address, 
                  city: val, cityName: option.label, 
                  district: null, districtName: null, 
                  ward: null, wardName: null 
                });
                if (touched.city) handleBlur('city');
              }}
            />
            {errors.city && <span className="text-rose-500 text-[11px] font-semibold mt-1 pl-1">{errors.city}</span>}
          </div>

          <div className="flex flex-col">
            <Select 
              showSearch 
              placeholder="Chọn Quận / Huyện" 
              size="large" 
              className="w-full custom-checkout-select"
              disabled={!address.city} 
              loading={loadingDistricts} 
              value={address.district}
              status={errors.district ? 'error' : ''}
              options={districtOptions} // Đã dùng mảng option an toàn
              onBlur={() => handleBlur('district')}
              onChange={(val, option) => {
                setAddress({ 
                  ...address, 
                  district: val, districtName: option.label,
                  ward: null, wardName: null
                });
                if (touched.district) handleBlur('district');
              }}
            />
            {errors.district && <span className="text-rose-500 text-[11px] font-semibold mt-1 pl-1">{errors.district}</span>}
          </div>

          <div className="flex flex-col">
            <Select 
              showSearch 
              placeholder="Chọn Phường / Xã" 
              size="large" 
              className="w-full custom-checkout-select"
              disabled={!address.district} 
              loading={loadingWards} 
              value={address.ward}
              status={errors.ward ? 'error' : ''}
              options={wardOptions} // Đã dùng mảng option an toàn
              onBlur={() => handleBlur('ward')}
              onChange={(val, option) => {
                setAddress({ ...address, ward: val, wardName: option.label });
                if (touched.ward) handleBlur('ward');
              }}
            />
            {errors.ward && <span className="text-rose-500 text-[11px] font-semibold mt-1 pl-1">{errors.ward}</span>}
          </div>
       </div>
       
       <div className="flex flex-col gap-4">
           <div>
               <span className="text-[12px] font-bold text-slate-600 mb-1.5 block">
                 Địa chỉ cụ thể <span className="text-rose-500">*</span>
               </span>
               <Input.TextArea 
                  placeholder="Số nhà, tên đường, tòa nhà..." 
                  rows={2} 
                  className="rounded-xl p-3 resize-none font-medium"
                  status={errors.detail ? 'error' : ''}
                  value={address.detail} 
                  onBlur={() => handleBlur('detail')}
                  onChange={(e) => setAddress({...address, detail: e.target.value})} 
               />
               {errors.detail && <span className="text-rose-500 text-[11px] font-semibold mt-1 pl-1 block">{errors.detail}</span>}
           </div>

           <div>
               <span className="text-[12px] font-bold text-slate-600 mb-1.5 block">
                 Ghi chú đơn hàng (Tùy chọn)
               </span>
               <Input.TextArea 
                  placeholder="Giao giờ hành chính, để ở quầy lễ tân..." 
                  rows={2} 
                  className="rounded-xl p-3 resize-none font-medium"
                  value={note} 
                  onChange={(e) => setNote(e.target.value)} 
               />
           </div>
       </div>
    </div>
  );
}