// File: src/modules/client/address/components/AddressModal.jsx
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Switch, Button } from 'antd';
import { useGetCities, useGetDistricts, useGetWards, useCreateAddress, useUpdateAddress } from '@/hooks/useAddress';

export default function AddressModal({ isOpen, onClose, editData }) {
  const [form] = Form.useForm();
  const isEdit = !!editData;

  // States để lưu mã Tỉnh/Huyện đang được chọn (để trigger API cấp dưới)
  const [selectedCityCode, setSelectedCityCode] = useState(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState(null);

  // Gọi Hooks lấy data Goship
  const { data: cities = [], isLoading: isLoadingCities } = useGetCities();
  const { data: districts = [], isLoading: isLoadingDistricts } = useGetDistricts(selectedCityCode);
  const { data: wards = [], isLoading: isLoadingWards } = useGetWards(selectedDistrictCode);

  const { mutate: createAddress, isLoading: isCreating } = useCreateAddress();
  const { mutate: updateAddress, isLoading: isUpdating } = useUpdateAddress();

  // Đổ dữ liệu vào Form khi ấn Sửa
  useEffect(() => {
    if (isOpen && editData) {
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
    } else if (isOpen && !editData) {
      form.resetFields();
      setSelectedCityCode(null);
      setSelectedDistrictCode(null);
    }
  }, [isOpen, editData, form]);

  // Xử lý Xóa Modal
  const handleClose = () => {
    form.resetFields();
    setSelectedCityCode(null);
    setSelectedDistrictCode(null);
    onClose();
  };

  // Logic khi đổi Tỉnh -> Reset Huyện/Xã
  const handleCityChange = (val) => {
    setSelectedCityCode(val);
    form.setFieldsValue({ districtCode: null, wardCode: null });
    setSelectedDistrictCode(null);
  };

  // Logic khi đổi Huyện -> Reset Xã
  const handleDistrictChange = (val) => {
    setSelectedDistrictCode(val);
    form.setFieldsValue({ wardCode: null });
  };

  // SUBMIT FORM
  const onFinish = (values) => {
    // 1. Tìm TÊN Tỉnh, Huyện, Xã từ mảng data để gửi kèm lên Backend
    const cityName = cities.find(c => c.id === values.cityCode)?.name || editData?.city;
    const districtName = districts.find(d => d.id === values.districtCode)?.name || editData?.district;
    const wardName = wards.find(w => w.id === values.wardCode)?.name || editData?.ward;

    // 2. Build Payload chuẩn JSON Backend yêu cầu
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

    // 3. Gọi API
    if (isEdit) {
      updateAddress({ id: editData.id, data: payload }, { onSuccess: handleClose });
    } else {
      createAddress(payload, { onSuccess: handleClose });
    }
  };

  return (
    <Modal
      title={<h3 className="text-lg font-bold">{isEdit ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}</h3>}
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      centered
    >
      <Form form={form} layout="vertical" onFinish={onFinish} className="mt-4">
        <div className="grid grid-cols-2 gap-4">
          <Form.Item 
            name="fullName" 
            label="Họ và tên" 
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input size="large" placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item 
            name="phone" 
            label="Số điện thoại" 
            rules={[
              { required: true, message: 'Vui lòng nhập SDT' },
              { pattern: /^[0-9]{10}$/, message: 'SDT không hợp lệ' }
            ]}
          >
            <Input size="large" placeholder="0912345678" />
          </Form.Item>
        </div>

        <Form.Item name="cityCode" label="Tỉnh/Thành phố" rules={[{ required: true, message: 'Chọn Tỉnh/Thành' }]}>
          <Select
            size="large"
            placeholder="Chọn Tỉnh/Thành phố"
            loading={isLoadingCities}
            onChange={handleCityChange}
            options={cities.map(c => ({ label: c.name, value: c.id }))}
            showSearch
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          />
        </Form.Item>

        <Form.Item name="districtCode" label="Quận/Huyện" rules={[{ required: true, message: 'Chọn Quận/Huyện' }]}>
          <Select
            size="large"
            placeholder="Chọn Quận/Huyện"
            loading={isLoadingDistricts}
            onChange={handleDistrictChange}
            disabled={!selectedCityCode}
            options={districts.map(d => ({ label: d.name, value: d.id }))}
            showSearch
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          />
        </Form.Item>

        <Form.Item name="wardCode" label="Phường/Xã" rules={[{ required: true, message: 'Chọn Phường/Xã' }]}>
          <Select
            size="large"
            placeholder="Chọn Phường/Xã"
            loading={isLoadingWards}
            disabled={!selectedDistrictCode}
            options={wards.map(w => ({ label: w.name, value: w.id }))}
            showSearch
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          />
        </Form.Item>

        <Form.Item name="addressDetail" label="Địa chỉ cụ thể" rules={[{ required: true, message: 'Nhập địa chỉ chi tiết' }]}>
          <Input.TextArea rows={2} placeholder="Số nhà, Tên đường..." />
        </Form.Item>

        <Form.Item name="isDefault" valuePropName="checked">
          <div className="flex items-center gap-2">
            <Switch /> <span className="text-gray-600 font-medium">Đặt làm địa chỉ mặc định</span>
          </div>
        </Form.Item>

        <div className="flex justify-end gap-3 mt-6">
          <Button size="large" onClick={handleClose}>Hủy</Button>
          <Button size="large" type="primary" htmlType="submit" className="bg-blue-600" loading={isCreating || isUpdating}>
            Hoàn thành
          </Button>
        </div>
      </Form>
    </Modal>
  );
}