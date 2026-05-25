// File: src/modules/admin/inventory/components/InventoryFormModal.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Modal, Form, Select, InputNumber, Card, Row, Col, message, Tooltip, Empty, Spin } from 'antd';
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import Button from '@/components/ui/Button'; 
import Input from '@/components/ui/Input';    
import { useCreateNote } from '@/hooks/useInventory';
import { useSearchSimpleVariants } from '@/hooks/useProducts'; 
import { extractSerialsFromExcel } from '@/utils/excelHelper';

const { Option } = Select;

const InventoryFormModal = ({ visible, onClose, onSuccess, type }) => {
    const [form] = Form.useForm();
    const { mutate: createNote, isPending } = useCreateNote();
    
    const [searchKeyword, setSearchKeyword] = useState('');
    const searchTimeout = useRef(null); 

    const fileInputRef = useRef(null);
    const [activeImportIndex, setActiveImportIndex] = useState(null);

    // KÍCH HOẠT HOOK VỚI KEYWORD DỰA TRÊN STATE, CONFIG ENABLED CHẠY ĐỂ TRÁNH TỰ ĐỘNG TẢI KHI KHÔNG CẦN
    const { data: variantOptions = [], isFetching: fetchingVariants, refetch } = useSearchSimpleVariants(searchKeyword, 20);

    const handleSearchVariant = (value) => {
        setSearchKeyword(value);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        
        // Debounce 500ms trước khi ép React Query thực hiện refetch dữ liệu mới từ máy chủ
        searchTimeout.current = setTimeout(() => {
            refetch();
        }, 500);
    };

    useEffect(() => {
        if (visible) {
            form.resetFields();
            form.setFieldsValue({ 
                type: type, 
                userId: 1, 
                details: [{ quantity: 1, price: 0 }] 
            });
            setSearchKeyword('');
            setTimeout(() => refetch(), 0); // Kích hoạt nạp dữ liệu danh sách ban đầu trống lần đầu tiên
        }
    }, [visible, type, form, refetch]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const importedSerials = await extractSerialsFromExcel(file);
            const currentDetails = form.getFieldValue('details') || [];
            const currentSerials = currentDetails[activeImportIndex]?.serialNumbers || [];
            const mergedSerials = Array.from(new Set([...currentSerials, ...importedSerials]));
            
            if (mergedSerials.length < currentSerials.length + importedSerials.length) {
                message.info("Hệ thống đã tự động lọc bỏ các mã IMEI bị trùng lặp.");
            }

            currentDetails[activeImportIndex].serialNumbers = mergedSerials;
            currentDetails[activeImportIndex].quantity = mergedSerials.length; 
            form.setFieldsValue({ details: currentDetails });
            
            form.validateFields([['details', activeImportIndex, 'serialNumbers']]);
            message.success(`Đã import thành công ${mergedSerials.length - currentSerials.length} mã IMEI mới!`);
        } catch (error) {
            message.error(error.message);
        } finally {
            e.target.value = null;
        }
    };

    const triggerExcelImport = (index) => {
        setActiveImportIndex(index);
        fileInputRef.current.click();
    };

    const onFinish = (values) => {
        const details = values.details || [];
        if (details.length === 0) return message.error("Vui lòng thêm ít nhất 1 sản phẩm vào phiếu!");

        const variantIds = details.map(d => d.productVariantId);
        if (variantIds.some((id, idx) => variantIds.indexOf(id) !== idx)) {
            return message.error("Phát hiện sản phẩm bị trùng lặp. Vui lòng gộp chung số lượng lại!");
        }

        createNote(values, {
            onSuccess: () => {
                message.success(`Tạo phiếu ${type === 'IMPORT' ? 'Nhập' : 'Xuất'} kho thành công!`);
                if(onSuccess) onSuccess();
                onClose(); 
            },
            onError: (error) => {
                const errData = error.response?.data;
                message.error(errData?.messages || errData?.message || 'Có lỗi xảy ra từ máy chủ!');
            }
        });
    };

    return (
        <Modal
            title={<div className="text-base font-bold text-gray-800 uppercase tracking-wide pb-2 border-b border-gray-100">{type === 'IMPORT' ? 'Phiếu Nhập Kho' : 'Phiếu Xuất Kho'}</div>}
            open={visible}
            onCancel={onClose}
            footer={null} 
            width={1000} 
            destroyOnClose
            maskClosable={false}
            centered
        >
            <Spin spinning={isPending} tip="Đang xử lý phiếu kho...">
                <input type="file" accept=".xlsx, .xls, .csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

                <Form form={form} layout="vertical" onFinish={onFinish} disabled={isPending} className="mt-4 font-sans">
                    <Row gutter={12}>
                        <Col span={8}>
                            <Form.Item name="type" className="hidden"><Input /></Form.Item>
                            <Form.Item name="userId" className="hidden"><Input /></Form.Item>
                            <Form.Item name="reason" rules={[{ required: true, message: 'Lý do không được để trống!' }]} className="m-0">
                                <Input label="Lý do điều chuyển *" placeholder={`VD: ${type === 'IMPORT' ? 'Nhập' : 'Xuất'} hàng tháng...`} className="h-9 text-xs rounded-md" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="supplierName" className="m-0"><Input label="Đối tác / Nhà cung cấp" placeholder="Tên công ty, chi nhánh..." className="h-9 text-xs rounded-md" /></Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="note" className="m-0"><Input label="Ghi chú nội bộ" placeholder="Ghi chú thêm nếu có..." className="h-9 text-xs rounded-md" /></Form.Item>
                        </Col>
                    </Row>

                    <Card 
                        title={<span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Danh sách mặt hàng thực tế</span>} 
                        size="small" 
                        className="bg-gray-50/50 border border-gray-200 mt-4 rounded-lg shadow-none" 
                        bodyStyle={{ padding: '12px' }}
                    >
                        <Form.List name="details">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.length === 0 && <Empty description="Chưa có sản phẩm nào. Vui lòng thêm dòng mặt hàng!" className="my-6 text-xs text-gray-400" />}
                                    
                                    {fields.map(({ key, name, ...restField }, index) => (
                                        <div key={key} className="bg-white p-3.5 mb-3 rounded-lg border border-gray-200 relative group transition-colors hover:border-gray-300">
                                            <div className="absolute top-2.5 right-2.5 z-10">
                                                <Tooltip title="Xóa dòng">
                                                    <button 
                                                        type="button"
                                                        className="w-7 h-7 rounded border-none bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center cursor-pointer"
                                                        onClick={() => remove(name)}
                                                    >
                                                        <MinusCircleOutlined className="text-sm" />
                                                    </button>
                                                </Tooltip>
                                            </div>

                                            <Row gutter={12} className="pr-8"> 
                                                <Col span={10}>
                                                    <Form.Item {...restField} name={[name, 'productVariantId']} label={<span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Mặt hàng lựa chọn *</span>} rules={[{ required: true, message: 'Chọn sản phẩm!' }]} className="mb-0">
                                                        <Select 
                                                            showSearch 
                                                            placeholder="Gõ tìm kiếm tên hoặc SKU..." 
                                                            onSearch={handleSearchVariant} 
                                                            filterOption={false} 
                                                            popupClassName="!w-[420px]" 
                                                            className="h-9 text-xs"
                                                            notFoundContent={fetchingVariants ? <Spin size="small" className="p-2 w-full flex justify-center" /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không tìm thấy sản phẩm" />}
                                                        >
                                                            {variantOptions.map(v => (
                                                                <Option key={v.id} value={v.id} title={`${v.productName} (${v.options})`}>
                                                                    <div className="flex flex-col py-0.5 leading-snug">
                                                                        <div className="font-bold text-gray-800 text-xs truncate">{v.productName}</div>
                                                                        <div className="text-[10px] text-gray-400 font-medium mt-0.5">Phân loại: <span className="text-blue-600 font-mono font-bold">{v.options}</span> | SKU: {v.sku}</div>
                                                                    </div>
                                                                </Option>
                                                            ))}
                                                        </Select>
                                                    </Form.Item>
                                                </Col>

                                                <Col span={6}>
                                                    <Form.Item {...restField} name={[name, 'quantity']} label={<span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Số lượng *</span>} rules={[{ required: true, message: 'Nhập số lượng!' }, { type: 'number', min: 1, message: 'Tối thiểu 1' }]} className="mb-0">
                                                        <InputNumber min={1} className="w-full h-9 text-xs rounded-md flex items-center" placeholder="0" onChange={() => form.validateFields([['details', name, 'serialNumbers']])} />
                                                    </Form.Item>
                                                </Col>

                                                <Col span={8}>
                                                    <Form.Item {...restField} name={[name, 'price']} label={<span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Đơn giá (VNĐ) *</span>} rules={[{ required: true, message: 'Nhập đơn giá!' }]} className="mb-0">
                                                        <InputNumber min={0} className="!w-[150px] h-9 text-xs rounded-md flex items-center" placeholder="0" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <div className="mt-3 pt-3 border-t border-gray-100 bg-gray-50/40 -mx-3.5 px-3.5 -mb-3.5 pb-3 rounded-b-lg">
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                                                        📦 Quản lý mã định danh Serial / IMEI <span className="text-[10px] text-gray-400 font-normal normal-case italic">(Tùy chọn)</span>
                                                    </label>
                                                    <Tooltip title="Hệ thống tự động đọc dữ liệu tại Cột A của file excel.">
                                                        <button 
                                                            type="button" 
                                                            className="h-7 px-3 text-[11px] font-bold text-blue-600 border border-blue-200 rounded bg-white hover:bg-blue-50 transition-colors cursor-pointer flex items-center gap-1 shadow-none" 
                                                            onClick={(e) => { e.preventDefault(); triggerExcelImport(index); }}
                                                        >
                                                            <UploadOutlined className="text-xs" /> Nhập file Excel
                                                        </button>
                                                    </Tooltip>
                                                </div>

                                                <Form.Item 
                                                    {...restField} name={[name, 'serialNumbers']} className="mb-0" dependencies={[['details', name, 'quantity']]} 
                                                    rules={[{
                                                        validator(_, value) {
                                                            const qty = form.getFieldValue(['details', name, 'quantity']) || 0;
                                                            const serialCount = value ? value.length : 0;
                                                            if (serialCount > 0 && serialCount !== qty) return Promise.reject(new Error(`Số lượng IMEI đã nhập (${serialCount}) không khớp với số lượng mặt hàng đã chốt (${qty})!`));
                                                            if (value && value.some(v => String(v).trim() === '')) return Promise.reject(new Error('Phát hiện có chuỗi mã IMEI rỗng.'));
                                                            return Promise.resolve();
                                                        },
                                                    }]}
                                                >
                                                    <Select mode="tags" style={{ width: '100%' }} placeholder="Quét mã vạch trực tiếp hoặc dán danh sách mã vào đây..." open={false} tokenSeparators={[',', '\n', ' ']} className="inventory-serial-select text-xs [&_.ant-select-selector]:!rounded-md" />
                                                </Form.Item>
                                            </div>
                                        </div>
                                    ))}

                                    <Form.Item className="mt-3 mb-0">
                                        <button 
                                            type="button" 
                                            className="w-full h-11 border-dashed border-2 border-gray-200 text-blue-600 bg-blue-50/40 hover:bg-blue-50 transition-colors font-bold text-xs uppercase tracking-wide rounded-lg cursor-pointer flex items-center justify-center gap-1.5" 
                                            onClick={() => add({ quantity: 1, price: 0 })}
                                        >
                                            <PlusOutlined className="text-sm" /> Thêm dòng mặt hàng mới
                                        </button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </Card>

                    <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-gray-100">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={isPending} className="h-9 px-4 text-xs font-semibold uppercase tracking-wide">Hủy bỏ</Button>
                        <Button type="submit" variant="primary" loading={isPending} className="h-9 px-5 text-xs font-semibold uppercase tracking-wide bg-blue-600 text-white hover:bg-blue-700 rounded-md">LƯU & CHỐT PHIẾU</Button>
                    </div>
                </Form>
            </Spin>
        </Modal>
    );
};

export default InventoryFormModal;