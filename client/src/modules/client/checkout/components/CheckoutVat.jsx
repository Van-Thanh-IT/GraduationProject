// File: src/modules/client/checkout/components/CheckoutVat.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Input, Button, Switch } from 'antd';
import { toast } from 'react-toastify';
import { FileTextOutlined, SearchOutlined, MailOutlined } from '@ant-design/icons';

export default function CheckoutVat({ vatInfo, setVatInfo }) {
  const [isFetchingTax, setIsFetchingTax] = useState(false);
  const [taxError, setTaxError] = useState('');
  const [touched, setTouched] = useState({});

  const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }));

  const errors = {
    taxCode: touched.taxCode && !vatInfo.taxCode?.trim() ? 'Vui lòng nhập mã số thuế' : '',
    companyName: touched.companyName && !vatInfo.companyName?.trim() ? 'Vui lòng nhập tên công ty' : '',
    companyAddress: touched.companyAddress && !vatInfo.companyAddress?.trim() ? 'Vui lòng nhập địa chỉ công ty' : '',
    companyEmail: touched.companyEmail && !vatInfo.companyEmail?.trim() ? 'Vui lòng nhập email nhận hóa đơn' : 
                  touched.companyEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vatInfo.companyEmail?.trim()) ? 'Email không hợp lệ' : ''
  };

  const handleFetchTaxInfo = async () => {
      const code = vatInfo.taxCode?.trim();
      if (!code) {
          setTaxError("Vui lòng nhập Mã số thuế để tra cứu!");
          setTouched(prev => ({ ...prev, taxCode: true }));
          return;
      }

      setIsFetchingTax(true);
      setTaxError('');

      try {
          const res = await axios.get(`https://api.vietqr.io/v2/business/${code}`);
          if (res.data && res.data.code === "00") {
              setVatInfo({
                  ...vatInfo,
                  companyName: res.data.data.name,
                  companyAddress: res.data.data.address
              });
              toast.success("Tra cứu thông tin công ty thành công!");
          } else {
              setTaxError(res.data?.desc || "Mã số thuế không tồn tại hoặc đã ngừng hoạt động.");
              setVatInfo({ ...vatInfo, companyName: '', companyAddress: '' }); 
          }
      } catch (error) {
          console.error(error);
          setTaxError("Lỗi hệ thống hoặc API tra cứu đang bảo trì.");
      } finally {
          setIsFetchingTax(false);
      }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 transition-all duration-300">
       <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-black text-slate-800 m-0 flex items-center gap-2">
            <FileTextOutlined className="text-indigo-500" /> 4. Yêu cầu xuất hóa đơn (VAT)
          </h3>
          <Switch 
            checked={vatInfo?.isVatRequired}
            onChange={(checked) => {
               setVatInfo({ ...vatInfo, isVatRequired: checked });
               if(!checked) {
                 setTaxError('');
                 setTouched({});
               }
            }}
          />
       </div>

       {vatInfo?.isVatRequired && (
          <div className="mt-6 flex flex-col gap-4 bg-slate-50 border border-slate-100 p-5 rounded-2xl animate-fade-in">
             
             <div>
               <span className="text-[12px] font-bold text-slate-600 mb-1.5 block">
                 Mã số thuế <span className="text-rose-500">*</span>
               </span>
               <div className="flex gap-2">
                   <Input 
                     placeholder="VD: 0100150619" 
                     value={vatInfo.taxCode}
                     status={errors.taxCode || taxError ? 'error' : ''}
                     onBlur={() => handleBlur('taxCode')}
                     onChange={(e) => {
                        setVatInfo({ ...vatInfo, taxCode: e.target.value });
                        if (taxError) setTaxError('');
                     }}
                     onPressEnter={handleFetchTaxInfo} 
                     className={`rounded-xl h-11 uppercase font-bold tracking-wider ${taxError ? 'bg-rose-50/30' : 'text-indigo-700'}`}
                   />
                   <Button 
                     type="primary"
                     icon={<SearchOutlined />}
                     loading={isFetchingTax}
                     onClick={handleFetchTaxInfo}
                     className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold px-5 shadow-sm"
                   >
                     Tra cứu
                   </Button>
               </div>
               {(errors.taxCode || taxError) && (
                 <span className="text-rose-500 text-[11px] font-semibold pl-1 mt-1 block animate-pulse">
                   {errors.taxCode || taxError}
                 </span>
               )}
             </div>

             <div>
               <span className="text-[12px] font-bold text-slate-600 mb-1.5 block">Tên công ty <span className="text-rose-500">*</span></span>
               <Input 
                  placeholder="Tên công ty sẽ tự động điền..." 
                  value={vatInfo.companyName} 
                  status={errors.companyName ? 'error' : ''}
                  onBlur={() => handleBlur('companyName')}
                  onChange={(e) => setVatInfo({ ...vatInfo, companyName: e.target.value })} 
                  className="rounded-xl h-11 font-medium" 
               />
               {errors.companyName && <span className="text-rose-500 text-[11px] font-semibold mt-1 pl-1 block">{errors.companyName}</span>}
             </div>

             <div>
               <span className="text-[12px] font-bold text-slate-600 mb-1.5 block">Địa chỉ công ty <span className="text-rose-500">*</span></span>
               <Input.TextArea 
                  placeholder="Địa chỉ công ty sẽ tự động điền..." 
                  rows={2} 
                  value={vatInfo.companyAddress} 
                  status={errors.companyAddress ? 'error' : ''}
                  onBlur={() => handleBlur('companyAddress')}
                  onChange={(e) => setVatInfo({ ...vatInfo, companyAddress: e.target.value })} 
                  className="rounded-xl p-3 resize-none font-medium" 
               />
               {errors.companyAddress && <span className="text-rose-500 text-[11px] font-semibold mt-1 pl-1 block">{errors.companyAddress}</span>}
             </div>

             <div>
               <span className="text-[12px] font-bold text-slate-600 mb-1.5 block">Email nhận hóa đơn <span className="text-rose-500">*</span></span>
               <Input 
                  prefix={<MailOutlined className="text-slate-400 mr-1" />}
                  placeholder="VD: ketoan@congty.com" 
                  type="email"
                  value={vatInfo.companyEmail} 
                  status={errors.companyEmail ? 'error' : ''}
                  onBlur={() => handleBlur('companyEmail')}
                  onChange={(e) => setVatInfo({ ...vatInfo, companyEmail: e.target.value })} 
                  className="rounded-xl h-11 font-medium" 
               />
               {errors.companyEmail && <span className="text-rose-500 text-[11px] font-semibold mt-1 pl-1 block">{errors.companyEmail}</span>}
             </div>

             <div className="flex items-start gap-2 mt-1">
               <span className="text-amber-500 text-lg leading-none">*</span>
               <p className="text-[11px] text-slate-500 font-medium m-0 leading-snug">
                 Hãy nhập Mã số thuế và bấm "Tra cứu" để tự động điền thông tin chính xác nhất. Hóa đơn điện tử (VAT) sẽ được gửi qua Email bạn vừa cung cấp ở trên.
               </p>
             </div>
          </div>
       )}
    </div>
  );
}