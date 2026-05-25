// File: src/modules/client/checkout/components/CheckoutAddress.jsx
import React, { useState, useEffect } from 'react';
import { Select, Input, Spin } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import { MapPin } from 'lucide-react';
import { useGetMyAddresses } from '@/hooks/useAddress';
import { useGetProfile } from '@/hooks/useProfile';

export default function CheckoutAddress({ 
  address, setAddress, 
  cities, districts, wards, 
  loadingDistricts, loadingWards,
  note, setNote
}) {
  const [touched, setTouched] = useState({});
  const [hasAutoFilled, setHasAutoFilled] = useState(false);

  const { data: myAddresses, isLoading: loadingAddresses } = useGetMyAddresses();
  const { data: profile } = useGetProfile();

  useEffect(() => {
    // Chỉ chạy khi dữ liệu myAddresses đã được fetch về (khác undefined) và chưa auto-fill
    if (myAddresses !== undefined && !hasAutoFilled) {
      if (myAddresses.length > 0) {
        // LUỒNG 1 (Cũ): Đã có địa chỉ -> Lấy địa chỉ mặc định hoặc cái đầu tiên
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
      } else if (profile) {
        // LUỒNG 2 (Mới): Chưa có địa chỉ nào -> Điền username và phone từ profile
        setAddress(prev => ({
          ...prev,
          fullName: profile.username || '',
          phone: profile.phone || ''
        }));
        setHasAutoFilled(true);
      }
    }
  }, [myAddresses, profile, hasAutoFilled, setAddress]);

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
    <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-200 relative font-sans">
       
       {loadingAddresses && (
         <div className="absolute inset-0 z-10 bg-white/60 flex items-center justify-center rounded-xl">
           <Spin />
         </div>
       )}

       <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
         <h3 className="text-[15px] font-bold text-gray-800 flex items-center gap-1.5 m-0 uppercase tracking-wide">
           <ShopOutlined className="text-blue-500" /> 1. Địa chỉ giao hàng
         </h3>
         {hasAutoFilled && myAddresses?.length > 0 && (
           <span className="flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">
             <MapPin size={12} /> Địa chỉ mặc định
           </span>
         )}
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="flex flex-col">
            <Input 
              placeholder="Họ và tên người nhận" 
              size="middle" 
              className={`rounded-md ${errors.fullName ? 'border-red-500' : ''}`}
              status={errors.fullName ? 'error' : ''}
              value={address.fullName} 
              onBlur={() => handleBlur('fullName')}
              onChange={(e) => setAddress({...address, fullName: e.target.value})} 
            />
            {errors.fullName && <span className="text-red-500 text-[11px] font-medium mt-0.5 ml-1">{errors.fullName}</span>}
          </div>
          
          <div className="flex flex-col">
            <Input 
              placeholder="Số điện thoại" 
              size="middle" 
              className={`rounded-md ${errors.phone ? 'border-red-500' : ''}`}
              status={errors.phone ? 'error' : ''}
              value={address.phone} 
              onBlur={() => handleBlur('phone')}
              onChange={(e) => setAddress({...address, phone: e.target.value})} 
            />
            {errors.phone && <span className="text-red-500 text-[11px] font-medium mt-0.5 ml-1">{errors.phone}</span>}
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div className="flex flex-col">
            <Select 
              showSearch 
              placeholder="Chọn Tỉnh / Thành" 
              size="middle" 
              className="w-full"
              status={errors.city ? 'error' : ''}
              value={address.city}
              options={cityOptions}
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
            {errors.city && <span className="text-red-500 text-[11px] font-medium mt-0.5 ml-1">{errors.city}</span>}
          </div>

          <div className="flex flex-col">
            <Select 
              showSearch 
              placeholder="Chọn Quận / Huyện" 
              size="middle" 
              className="w-full"
              disabled={!address.city} 
              loading={loadingDistricts} 
              value={address.district}
              status={errors.district ? 'error' : ''}
              options={districtOptions}
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
            {errors.district && <span className="text-red-500 text-[11px] font-medium mt-0.5 ml-1">{errors.district}</span>}
          </div>

          <div className="flex flex-col">
            <Select 
              showSearch 
              placeholder="Chọn Phường / Xã" 
              size="middle" 
              className="w-full"
              disabled={!address.district} 
              loading={loadingWards} 
              value={address.ward}
              status={errors.ward ? 'error' : ''}
              options={wardOptions}
              onBlur={() => handleBlur('ward')}
              onChange={(val, option) => {
                setAddress({ ...address, ward: val, wardName: option.label });
                if (touched.ward) handleBlur('ward');
              }}
            />
            {errors.ward && <span className="text-red-500 text-[11px] font-medium mt-0.5 ml-1">{errors.ward}</span>}
          </div>
       </div>
       
       <div className="flex flex-col gap-3">
           <div>
               <span className="text-[12px] font-semibold text-gray-600 mb-1 block">
                 Địa chỉ cụ thể <span className="text-red-500">*</span>
               </span>
               <Input.TextArea 
                 placeholder="Số nhà, tên đường, tòa nhà..." 
                 rows={2} 
                 className="rounded-md p-2 resize-none text-sm font-medium"
                 status={errors.detail ? 'error' : ''}
                 value={address.detail} 
                 onBlur={() => handleBlur('detail')}
                 onChange={(e) => setAddress({...address, detail: e.target.value})} 
               />
               {errors.detail && <span className="text-red-500 text-[11px] font-medium mt-0.5 ml-1 block">{errors.detail}</span>}
           </div>

           <div>
               <span className="text-[12px] font-semibold text-gray-600 mb-1 block">
                 Ghi chú đơn hàng (Tùy chọn)
               </span>
               <Input.TextArea 
                 placeholder="Giao giờ hành chính, để ở quầy lễ tân..." 
                 rows={2} 
                 className="rounded-md p-2 resize-none text-sm font-medium"
                 value={note} 
                 onChange={(e) => setNote(e.target.value)} 
               />
           </div>
       </div>
    </div>
  );
}