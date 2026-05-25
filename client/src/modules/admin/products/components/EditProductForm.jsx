// File: src/modules/admin/products/components/EditProductForm.jsx
import React, { useState } from 'react';
import { Tabs } from 'antd';
import { 
  InfoCircleOutlined, 
  UnorderedListOutlined, 
  AppstoreAddOutlined 
} from '@ant-design/icons';
import Button from '@/components/ui/Button';

import BasicInfoForm from './tab/BasicInfoForm';
import AttributeList from './tab/attribute/AttributeList';
import VariantList from './tab/variant/VariantList';

const TabContentWrapper = ({ children }) => (
  <div className="bg-gray-50/60 p-3.5 mt-2 rounded-xl border border-gray-200/60">
    {children}
  </div>
);

export default function EditProductForm({ initialData, onSuccess, onCancel }) {
  const [activeTab, setActiveTab] = useState('1');

  const tabItems = [
    {
      key: '1',
      label: (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${activeTab === '1' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-900'}`}>
          <InfoCircleOutlined className="text-sm shrink-0" />
          <span className="text-xs uppercase tracking-wide">Cơ Bản</span>
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
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${activeTab === '2' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-900'}`}>
          <UnorderedListOutlined className="text-sm shrink-0" />
          <span className="text-xs uppercase tracking-wide">Thông Số</span>
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
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${activeTab === '3' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-900'}`}>
          <AppstoreAddOutlined className="text-sm shrink-0" />
          <span className="text-xs uppercase tracking-wide">Biến Thể</span>
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
    <div className="flex flex-col h-full font-sans">
      
      {/* KHỬ ĐƯỜNG KẺ VÀ SỬA TABS VỀ DẠNG PHẲNG TỐI GIẢN */}
      <style dangerouslySetInnerHTML={{__html: `
        .clean-edit-tabs .ant-tabs-nav::before { border-bottom: 1px solid #f0f0f0 !important; }
        .clean-edit-tabs .ant-tabs-ink-bar { bg-color: #2563eb !important; height: 2px !important; }
        .clean-edit-tabs .ant-tabs-tab { padding: 0 4px 8px 4px !important; margin: 0 16px 0 0 !important; }
        .clean-edit-tabs .ant-tabs-nav { margin-bottom: 12px !important; }
      `}} />
      
      <div className="bg-white">
        <Tabs 
          className="clean-edit-tabs"
          activeKey={activeTab} 
          onChange={setActiveTab} 
          items={tabItems} 
        />
      </div>
      
      <div className="flex justify-end pt-3 mt-3 border-t border-gray-100">
        <Button 
          type="button"
          variant="outline"
          onClick={onCancel} 
          className="h-8.5 px-4 text-xs font-bold uppercase tracking-wide text-gray-500 bg-gray-100 hover:bg-gray-200 border-none rounded-md"
        >
          Đóng cửa sổ
        </Button>
      </div>
      
    </div>
  );
}