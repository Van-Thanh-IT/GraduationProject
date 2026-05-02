// File: src/modules/client/address/AddressPage.jsx
import React, { useState } from 'react';
import { Spin, Popconfirm, Empty, Badge } from 'antd';
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
    return <div className="flex justify-center items-center h-64"><Spin size="large" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Địa chỉ của tôi</h1>
          <p className="text-sm text-gray-500 font-medium">Quản lý thông tin giao hàng và liên hệ</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-md shadow-blue-200"
        >
          <Plus size={18} /> Thêm địa chỉ mới
        </button>
      </div>

      {/* List Addresses */}
      {addresses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 flex justify-center shadow-sm">
          <Empty description={<span className="text-gray-500 font-medium">Bạn chưa có địa chỉ nào</span>} />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {addresses.map((address) => (
            <div key={address.id} className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative">
              
              {address.isDefault && (
                <div className="absolute top-0 right-0 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl flex items-center gap-1">
                  <CheckCircle2 size={14} /> Mặc định
                </div>
              )}

              <div className="flex flex-col md:flex-row justify-between gap-4">
                
                {/* Thông tin */}
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-50 text-blue-600 p-2 rounded-full hidden sm:block">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-lg font-bold text-gray-800">{address.fullName}</span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-500 font-semibold">{address.phone}</span>
                    </div>
                    <p className="text-gray-600 text-[15px] mt-2">{address.addressDetail}</p>
                    <p className="text-gray-500 text-[14px] mt-0.5">
                      {address.ward}, {address.district}, {address.city}
                    </p>
                  </div>
                </div>

                {/* Hành động */}
                <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0 mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <div className="flex items-center gap-4 text-sm font-bold">
                    <button onClick={() => handleOpenEdit(address)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                      <Edit3 size={16} /> Sửa
                    </button>
                    {!address.isDefault && (
                      <Popconfirm title="Xóa địa chỉ này?" onConfirm={() => deleteAddress(address.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
                        <button className="text-rose-500 hover:text-rose-700 flex items-center gap-1">
                          <Trash2 size={16} /> Xóa
                        </button>
                      </Popconfirm>
                    )}
                  </div>
                  
                  {!address.isDefault && (
                    <button 
                      onClick={() => setDefault(address.id)}
                      className="px-4 py-1.5 mt-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-semibold hover:border-blue-500 hover:text-blue-600 transition-colors ml-auto md:ml-0"
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

      {/* Modal Render */}
      <AddressModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editData={editAddressData} 
      />
    </div>
  );
}