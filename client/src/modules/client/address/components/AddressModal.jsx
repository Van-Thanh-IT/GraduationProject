// File: src/modules/client/address/components/AddressModal.jsx
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Switch, Button } from 'antd';
import { useGetCities, useGetDistricts, useGetWards, useCreateAddress, useUpdateAddress } from '@/hooks/useAddress';
import { useGetProfile } from '@/hooks/useProfile';

export default function AddressModal({ isOpen, onClose, editData }) {
  const [form] = Form.useForm();
  const isEdit = !!editData;

  const [selectedCityCode, setSelectedCityCode] = useState(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState(null);

  const { data: profile } = useGetProfile();
  const { data: cities = [], isLoading: isLoadingCities } = useGetCities();
  const { data: districts = [], isLoading: isLoadingDistricts } = useGetDistricts(selectedCityCode);
  const { data: wards = [], isLoading: isLoadingWards } = useGetWards(selectedDistrictCode);

  const { mutate: createAddress, isLoading: isCreating } = useCreateAddress();
  const { mutate: updateAddress, isLoading: isUpdating } = useUpdateAddress();

  useEffect(() => {
    if (isOpen) {
      if (isEdit && editData) {
        form.setFieldsValue({
          fullName: editData.fullName,
          phone: editData.phone,
          cityCode: editData.cityCode,
          districtCode: editData.districtCode,
          wardCode: editData.wardCode,
          addressDetail: editData.addressDetail,
          isDefault: editData.isDefault,
        });
        setSelectedCityCode(editData.cityCode);
        setSelectedDistrictCode(editData.districtCode);
      } else {
        form.resetFields();
        // Tự động điền Username và Phone từ Profile khi thêm mới
        form.setFieldsValue({
          fullName: profile?.username || '',
          phone: profile?.phone || '',
          isDefault: false
        });
        setSelectedCityCode(null);
        setSelectedDistrictCode(null);
      }
    }
  }, [isOpen, editData, form, profile, isEdit]);

  const handleClose = () => {
    form.resetFields();
    setSelectedCityCode(null);
    setSelectedDistrictCode(null);
    onClose();
  };

  const handleCityChange = (val) => {
    setSelectedCityCode(val);
    form.setFieldsValue({ districtCode: null, wardCode: null });
    setSelectedDistrictCode(null);
  };

  const handleDistrictChange = (val) => {
    setSelectedDistrictCode(val);
    form.setFieldsValue({ wardCode: null });
  };

  const onFinish = (values) => {
    const cityName = cities.find(c => c.id === values.cityCode)?.name || editData?.city;
    const districtName = districts.find(d => d.id === values.districtCode)?.name || editData?.district;
    const wardName = wards.find(w => w.id === values.wardCode)?.name || editData?.ward;

    const payload = {
      fullName: values.fullName,
      phone: values.phone,
      addressDetail: values.addressDetail,
      city: cityName,
      district: districtName,
      ward: wardName,
      cityCode: values.cityCode,
      districtCode: values.districtCode,
      wardCode: values.wardCode,
      isDefault: values.isDefault || false,
    };

    if (isEdit) {
      updateAddress({ id: editData.id, data: payload }, { onSuccess: handleClose });
    } else {
      createAddress(payload, { onSuccess: handleClose });
    }
  };

  return (
    <Modal
      title={
        <div className="text-sm font-bold text-gray-800 uppercase tracking-wide pb-3 border-b border-gray-100">
          {isEdit ? 'Cập nhật địa chỉ nhận hàng' : 'Thêm địa chỉ nhận hàng mới'}
        </div>
      }
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      centered
      destroyOnClose
      width={600}
    >
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish} 
        className="mt-4 space-y-4 font-sans"
        requiredMark={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item 
            name="fullName" 
            label={<span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Họ và tên người nhận <span className="text-red-500">*</span></span>} 
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
            className="m-0"
          >
            <Input className="h-10 text-sm rounded-lg" placeholder="VD: Nguyễn Văn A" />
          </Form.Item>

          <Form.Item 
            name="phone" 
            label={<span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Số điện thoại <span className="text-red-500">*</span></span>} 
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^[0-9]{10}$/, message: 'Số điện thoại gồm 10 chữ số!' }
            ]}
            className="m-0"
          >
            <Input className="h-10 text-sm rounded-lg" placeholder="VD: 0912345678" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item 
            name="cityCode" 
            label={<span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Tỉnh/Thành phố <span className="text-red-500">*</span></span>} 
            rules={[{ required: true, message: 'Chọn Tỉnh/Thành!' }]}
            className="m-0"
          >
            <Select
              placeholder="Chọn Tỉnh/Thành"
              loading={isLoadingCities}
              onChange={handleCityChange}
              options={cities.map(c => ({ label: c.name, value: c.id }))}
              showSearch
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              className="h-10 text-sm [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selection-item]:!leading-[38px]"
            />
          </Form.Item>

          <Form.Item 
            name="districtCode" 
            label={<span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Quận/Huyện <span className="text-red-500">*</span></span>} 
            rules={[{ required: true, message: 'Chọn Quận/Huyện!' }]}
            className="m-0"
          >
            <Select
              placeholder="Chọn Quận/Huyện"
              loading={isLoadingDistricts}
              onChange={handleDistrictChange}
              disabled={!selectedCityCode}
              options={districts.map(d => ({ label: d.name, value: d.id }))}
              showSearch
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              className="h-10 text-sm [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selection-item]:!leading-[38px]"
            />
          </Form.Item>

          <Form.Item 
            name="wardCode" 
            label={<span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Phường/Xã <span className="text-red-500">*</span></span>} 
            rules={[{ required: true, message: 'Chọn Phường/Xã!' }]}
            className="m-0"
          >
            <Select
              placeholder="Chọn Phường/Xã"
              loading={isLoadingWards}
              disabled={!selectedDistrictCode}
              options={wards.map(w => ({ label: w.name, value: w.id }))}
              showSearch
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              className="h-10 text-sm [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selection-item]:!leading-[38px]"
            />
          </Form.Item>
        </div>

        <Form.Item 
          name="addressDetail" 
          label={<span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Địa chỉ cụ thể <span className="text-red-500">*</span></span>} 
          rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết!' }]}
          className="m-0"
        >
          <Input.TextArea rows={2} className="text-sm rounded-lg resize-none" placeholder="VD: Số nhà, Tên tòa nhà, Tên đường..." />
        </Form.Item>

        {/* ĐÃ FIX: Chuyển Form.Item vào bọc trực tiếp Switch và thêm noStyle */}
        <div className="flex items-center gap-2 bg-gray-50/80 p-3 rounded-lg border border-gray-100 mt-2">
          <Form.Item name="isDefault" valuePropName="checked" noStyle>
            <Switch size="small" /> 
          </Form.Item>
          <span className="text-sm font-semibold text-gray-700">Thiết lập làm địa chỉ mặc định</span>
        </div>

        <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-gray-100">
          <Button 
            onClick={handleClose} 
            className="h-10 px-6 font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 border-none rounded-lg transition-colors"
          >
            Hủy bỏ
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isCreating || isUpdating} 
            className="h-10 px-8 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm border-none"
          >
            {isEdit ? 'Lưu thay đổi' : 'Hoàn thành'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}