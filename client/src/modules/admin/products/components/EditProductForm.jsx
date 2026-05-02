import React, { useState } from 'react';
import { Tabs } from 'antd';
import { 
  InfoCircleOutlined, 
  UnorderedListOutlined, 
  AppstoreAddOutlined 
} from '@ant-design/icons';
import Button from '@/components/ui/Button';

// Import các Tab con
import BasicInfoForm from './tab/BasicInfoForm';
import AttributeList from './tab/attribute/AttributeList';
import VariantList from './tab/variant/VariantList';

const TabContentWrapper = ({ children }) => (
  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out bg-slate-50/50 p-4 mt-2 rounded-2xl border border-slate-100">
    {children}
  </div>
);

export default function EditProductForm({ initialData, onSuccess, onCancel }) {
  const [activeTab, setActiveTab] = useState('1');

  const tabItems = [
    {
      key: '1',
      label: (
        <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-300 ${activeTab === '1' ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50 border border-transparent'}`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${activeTab === '1' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-200 text-slate-500'}`}>
            <InfoCircleOutlined />
          </div>
          <div className="flex flex-col items-start">
            <span className={`text-sm font-black tracking-wide ${activeTab === '1' ? 'text-indigo-700' : 'text-slate-600'}`}>Cơ Bản</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Thông tin gốc</span>
          </div>
        </div>
      ),
      children: (
        <TabContentWrapper>
          <BasicInfoForm initialData={initialData} onSuccess={onSuccess} />
        </TabContentWrapper>
      )
    },
    {
      key: '2',
      label: (
        <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-300 ${activeTab === '2' ? 'bg-orange-50 border border-orange-100' : 'hover:bg-slate-50 border border-transparent'}`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${activeTab === '2' ? 'bg-orange-500 text-white shadow-md shadow-orange-200' : 'bg-slate-200 text-slate-500'}`}>
            <UnorderedListOutlined />
          </div>
          <div className="flex flex-col items-start">
            <span className={`text-sm font-black tracking-wide ${activeTab === '2' ? 'text-orange-700' : 'text-slate-600'}`}>Thông Số</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Cấu hình máy</span>
          </div>
        </div>
      ),
      children: (
        <TabContentWrapper>
          <AttributeList productId={initialData.id} />
        </TabContentWrapper>
      )
    },
    {
      key: '3',
      label: (
        <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-300 ${activeTab === '3' ? 'bg-emerald-50 border border-emerald-100' : 'hover:bg-slate-50 border border-transparent'}`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${activeTab === '3' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'bg-slate-200 text-slate-500'}`}>
            <AppstoreAddOutlined />
          </div>
          <div className="flex flex-col items-start">
            <span className={`text-sm font-black tracking-wide ${activeTab === '3' ? 'text-emerald-700' : 'text-slate-600'}`}>Biến Thể</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Kho & Hình ảnh</span>
          </div>
        </div>
      ),
      children: (
        <TabContentWrapper>
          <VariantList product={initialData} />
        </TabContentWrapper>
      )
    }
  ];

  return (
    <div className="flex flex-col h-full mt-2 relative">
      
      {/* Hack CSS nội bộ để ghi đè giao diện mặc định cứng nhắc của Ant Design Tabs
        Biến thanh tab thành dạng Button rời rạc, ẩn đường gạch chân gớm ghiếc
      */}
      <style dangerouslySetInnerHTML={{__html: `
        .premium-edit-tabs .ant-tabs-nav::before { border-bottom: none !important; }
        .premium-edit-tabs .ant-tabs-ink-bar { display: none !important; }
        .premium-edit-tabs .ant-tabs-tab { padding: 0 !important; margin: 0 12px 0 0 !important; border: none !important; background: transparent !important; }
        .premium-edit-tabs .ant-tabs-nav { margin-bottom: 24px !important; }
        .premium-edit-tabs .ant-tabs-tab-btn { outline: none !important; text-shadow: none !important; }
      `}} />
      
      <div className="bg-white rounded-t-2xl">
        <Tabs 
          className="premium-edit-tabs"
          activeKey={activeTab} 
          onChange={setActiveTab} 
          items={tabItems} 
        />
      </div>
      
      {/* KHU VỰC NÚT BẤM (Ghim dưới đáy) */}
      <div className="flex justify-end pt-5 mt-4 border-t border-slate-100">
        <Button 
          onClick={onCancel} 
          className="bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-600 px-8 py-2.5 font-bold transition-all active:scale-95"
        >
          Đóng Cửa Sổ Cập Nhật
        </Button>
      </div>
      
    </div>
  );
}