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
              setTaxError(res.data?.desc || "Mã số thuế không tồn tại.");
              setVatInfo({ ...vatInfo, companyName: '', companyAddress: '' }); 
          }
      } catch (error) {
          console.error(error);
          setTaxError("API tra cứu đang bảo trì.");
      } finally {
          setIsFetchingTax(false);
      }
  };

  return (
    <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-200 font-sans">
       <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h3 className="text-[15px] font-bold text-gray-800 m-0 flex items-center gap-1.5 uppercase tracking-wide">
            <FileTextOutlined className="text-blue-500" /> 4. Yêu cầu xuất hóa đơn (VAT)
          </h3>
          <Switch 
            size="small"
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
          <div className="mt-4 flex flex-col gap-3.5 bg-gray-50 p-4 rounded-lg border border-gray-100">
             
             <div>
               <span className="text-[12px] font-semibold text-gray-600 mb-1 block">
                 Mã số thuế <span className="text-red-500">*</span>
               </span>
               <div className="flex gap-2">
                   <Input 
                     placeholder="VD: 0100150619" 
                     size="middle"
                     value={vatInfo.taxCode}
                     status={errors.taxCode || taxError ? 'error' : ''}
                     onBlur={() => handleBlur('taxCode')}
                     onChange={(e) => {
                        setVatInfo({ ...vatInfo, taxCode: e.target.value });
                        if (taxError) setTaxError('');
                     }}
                     onPressEnter={handleFetchTaxInfo} 
                     className="rounded-md font-semibold tracking-wider"
                   />
                   <Button 
                     type="primary"
                     icon={<SearchOutlined />}
                     loading={isFetchingTax}
                     onClick={handleFetchTaxInfo}
                     className="bg-blue-600 hover:bg-blue-700 font-semibold rounded-md shadow-none px-4 shrink-0"
                   >
                     Tra cứu
                   </Button>
               </div>
               {(errors.taxCode || taxError) && (
                 <span className="text-red-500 text-[11px] font-medium pl-1 mt-0.5 block">
                   {errors.taxCode || taxError}
                 </span>
               )}
             </div>

             <div>
               <span className="text-[12px] font-semibold text-gray-600 mb-1 block">Tên công ty <span className="text-red-500">*</span></span>
               <Input 
                 placeholder="Tên công ty..." 
                 size="middle"
                 value={vatInfo.companyName} 
                 status={errors.companyName ? 'error' : ''}
                 onBlur={() => handleBlur('companyName')}
                 onChange={(e) => setVatInfo({ ...vatInfo, companyName: e.target.value })} 
                 className="rounded-md font-medium" 
               />
               {errors.companyName && <span className="text-red-500 text-[11px] font-medium mt-0.5 ml-1 block">{errors.companyName}</span>}
             </div>

             <div>
               <span className="text-[12px] font-semibold text-gray-600 mb-1 block">Địa chỉ công ty <span className="text-red-500">*</span></span>
               <Input.TextArea 
                 placeholder="Địa chỉ công ty..." 
                 rows={2} 
                 value={vatInfo.companyAddress} 
                 status={errors.companyAddress ? 'error' : ''}
                 onBlur={() => handleBlur('companyAddress')}
                 onChange={(e) => setVatInfo({ ...vatInfo, companyAddress: e.target.value })} 
                 className="rounded-md p-2 resize-none font-medium text-sm" 
               />
               {errors.companyAddress && <span className="text-red-500 text-[11px] font-medium mt-0.5 ml-1 block">{errors.companyAddress}</span>}
             </div>

             <div>
               <span className="text-[12px] font-semibold text-gray-600 mb-1 block">Email nhận hóa đơn <span className="text-red-500">*</span></span>
               <Input 
                 prefix={<MailOutlined className="text-gray-400 mr-1" />}
                 placeholder="VD: ketoan@congty.com" 
                 size="middle"
                 type="email"
                 value={vatInfo.companyEmail} 
                 status={errors.companyEmail ? 'error' : ''}
                 onBlur={() => handleBlur('companyEmail')}
                 onChange={(e) => setVatInfo({ ...vatInfo, companyEmail: e.target.value })} 
                 className="rounded-md font-medium" 
               />
               {errors.companyEmail && <span className="text-red-500 text-[11px] font-medium mt-0.5 ml-1 block">{errors.companyEmail}</span>}
             </div>

             <div className="flex items-start gap-1 mt-0.5">
               <span className="text-orange-500 text-xs leading-none">*</span>
               <p className="text-[11px] text-gray-400 font-medium m-0 leading-normal italic">
                 Hãy nhập Mã số thuế và bấm "Tra cứu" để tự động điền thông tin chính xác nhất.
               </p>
             </div>
          </div>
       )}
    </div>
  );
}