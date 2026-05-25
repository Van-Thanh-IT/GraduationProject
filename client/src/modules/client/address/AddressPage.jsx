// File: src/modules/client/address/AddressPage.jsx
import React, { useState } from 'react';
import { Spin, Popconfirm, Empty } from 'antd';
import { Plus, MapPin, Edit3, Trash2, CheckCircle2 } from 'lucide-react';
import { useGetMyAddresses, useDeleteAddress, useSetDefaultAddress } from '@/hooks/useAddress';
import AddressModal from './components/AddressModal';

export default function AddressPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editAddressData, setEditAddressData] = useState(null);

  const { data: addresses = [], isLoading } = useGetMyAddresses();
  const { mutate: deleteAddress } = useDeleteAddress();
  const { mutate: setDefault } = useSetDefaultAddress();
  
  const handleOpenCreate = () => {
    setEditAddressData(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (address) => {
    setEditAddressData(address);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 md:py-10 px-4 sm:px-6 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight m-0">Địa chỉ của tôi</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Quản lý thông tin giao hàng và liên hệ</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-md shrink-0"
        >
          <Plus size={18} strokeWidth={2.5} /> Thêm địa chỉ mới
        </button>
      </div>

      {/* LIST ADDRESSES SECTION */}
      {addresses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-12 md:py-20 flex justify-center shadow-sm">
          <Empty description={<span className="text-gray-500 font-medium">Bạn chưa có địa chỉ nào</span>} />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {addresses.map((address) => (
            <div 
              key={address.id} 
              className={`bg-white p-4 sm:p-5 md:p-6 rounded-2xl border transition-all relative overflow-hidden ${
                address.isDefault ? 'border-blue-200 shadow-sm' : 'border-gray-200 shadow-sm hover:shadow-md'
              }`}
            >
              
              {/* BADGE MẶC ĐỊNH */}
              {address.isDefault && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[11px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-bl-xl flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 size={14} strokeWidth={2.5} /> Mặc định
                </div>
              )}

              <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-6">
                
                {/* THÔNG TIN BÊN TRÁI */}
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="mt-0.5 bg-gray-50 border border-gray-100 text-gray-400 p-2.5 rounded-full hidden sm:flex shrink-0">
                    <MapPin size={22} className={address.isDefault ? 'text-blue-600' : ''} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1.5">
                      <span className="text-base md:text-lg font-bold text-gray-800">{address.fullName}</span>
                      <span className="text-gray-300 hidden sm:inline">|</span>
                      <span className="text-sm md:text-base text-gray-500 font-semibold">{address.phone}</span>
                    </div>
                    <p className="text-gray-700 text-sm md:text-[15px] leading-relaxed mb-1">
                      {address.addressDetail}
                    </p>
                    <p className="text-gray-500 text-xs md:text-[14px]">
                      {address.ward}, {address.district}, {address.city}
                    </p>
                  </div>
                </div>

                {/* HÀNH ĐỘNG BÊN PHẢI (RESPONSIVE) */}
                <div className="flex flex-wrap md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0 mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 w-full md:w-auto">
                  
                  {/* Nhóm Sửa / Xóa */}
                  <div className="flex items-center gap-4 text-[13px] font-bold">
                    <button 
                      onClick={() => handleOpenEdit(address)} 
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors"
                    >
                      <Edit3 size={15} strokeWidth={2.5} /> Sửa
                    </button>
                    {!address.isDefault && (
                      <Popconfirm 
                        title="Xóa địa chỉ này?" 
                        description="Bạn có chắc chắn muốn xóa địa chỉ này không?"
                        onConfirm={() => deleteAddress(address.id)} 
                        okText="Xóa" 
                        cancelText="Hủy" 
                        okButtonProps={{ danger: true, className: 'shadow-none' }}
                      >
                        <button className="text-red-500 hover:text-red-700 flex items-center gap-1.5 transition-colors">
                          <Trash2 size={15} strokeWidth={2.5} /> Xóa
                        </button>
                      </Popconfirm>
                    )}
                  </div>
                  
                  {/* Nút Thiết lập mặc định */}
                  {!address.isDefault && (
                    <button 
                      onClick={() => setDefault(address.id)}
                      className="px-4 py-1.5 md:mt-2 border border-gray-200 text-gray-600 bg-gray-50 rounded-lg text-xs font-bold uppercase tracking-wide hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all ml-auto md:ml-0"
                    >
                      Thiết lập mặc định
                    </button>
                  )}
                </div>
                
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL SECTION */}
      <AddressModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editData={editAddressData} 
      />
    </div>
  );
}