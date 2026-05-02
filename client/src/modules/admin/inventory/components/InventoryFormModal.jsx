import React, { useEffect, useState, useRef } from 'react';
import { Modal, Form, Select, InputNumber, Card, Row, Col, message, Tooltip, Empty, Spin } from 'antd';
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { ProductService } from '@/services/product.service';
import Button from '@/components/ui/Button'; 
import Input from '@/components/ui/Input';   
import { useCreateNote } from '@/hooks/useInventory';
import { extractSerialsFromExcel } from '@/utils/excelHelper'; // IMPORT HÀM XỬ LÝ EXCEL

const { Option } = Select;

const InventoryFormModal = ({ visible, onClose, onSuccess, type }) => {
    const [form] = Form.useForm();
    const { mutate: createNote, isPending } = useCreateNote();
    
    const [variantOptions, setVariantOptions] = useState([]);
    const [fetchingVariants, setFetchingVariants] = useState(false);
    const searchTimeout = useRef(null); 

    const fileInputRef = useRef(null);
    const [activeImportIndex, setActiveImportIndex] = useState(null);

    // ==========================================
    // LOGIC TÌM KIẾM SP & KHỞI TẠO
    // ==========================================
    const fetchVariants = async (keyword = '') => {
        setFetchingVariants(true);
        try {
            const res = await ProductService.searchSimpleVariant(keyword);
            setVariantOptions(res.data?.data || res.data || []); 
        } catch (error) {
            console.error("Lỗi tìm kiếm SP:", error);
        } finally {
            setFetchingVariants(false);
        }
    };

    const handleSearchVariant = (value) => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => fetchVariants(value), 500);
    };

    useEffect(() => {
        if (visible) {
            form.resetFields();
            form.setFieldsValue({ 
                type: type, 
                userId: 1, 
                details: [{ quantity: 1, price: 0 }] 
            });
            fetchVariants(''); 
        }
    }, [visible, type, form]);

    // ==========================================
    // LOGIC UPLOAD EXCEL ĐÃ ĐƯỢC LÀM SẠCH
    // ==========================================
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // Gọi hàm từ file helper
            const importedSerials = await extractSerialsFromExcel(file);

            const currentDetails = form.getFieldValue('details') || [];
            const currentSerials = currentDetails[activeImportIndex]?.serialNumbers || [];

            // Gộp mảng và loại bỏ trùng lặp
            const mergedSerials = Array.from(new Set([...currentSerials, ...importedSerials]));
            
            if (mergedSerials.length < currentSerials.length + importedSerials.length) {
                message.info("Hệ thống đã tự động lọc bỏ các mã IMEI bị trùng lặp.");
            }

            // Cập nhật lại form
            currentDetails[activeImportIndex].serialNumbers = mergedSerials;
            currentDetails[activeImportIndex].quantity = mergedSerials.length; 
            form.setFieldsValue({ details: currentDetails });
            
            form.validateFields([['details', activeImportIndex, 'serialNumbers']]);
            message.success(`Đã import thành công ${mergedSerials.length - currentSerials.length} mã IMEI mới!`);

        } catch (error) {
            message.error(error.message); // Hiển thị lỗi bắt được từ helper
        } finally {
            e.target.value = null; // Clear input để có thể up lại cùng 1 file
        }
    };

    const triggerExcelImport = (index) => {
        setActiveImportIndex(index);
        fileInputRef.current.click();
    };

    // ==========================================
    // SUBMIT FORM
    // ==========================================
    const onFinish = (values) => {
        const details = values.details || [];

        if (details.length === 0) return message.error("Vui lòng thêm ít nhất 1 sản phẩm vào phiếu!");

        const variantIds = details.map(d => d.productVariantId);
        if (variantIds.some((id, idx) => variantIds.indexOf(id) !== idx)) {
            return message.error("Phát hiện sản phẩm bị trùng lặp ở nhiều dòng. Vui lòng gộp chung số lượng lại!");
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
            title={<span className="text-xl font-bold">{type === 'IMPORT' ? 'Phiếu Nhập Kho' : 'Phiếu Xuất Kho'}</span>}
            open={visible}
            onCancel={onClose}
            footer={null} 
            width={1100} 
            destroyOnClose
            maskClosable={false}
        >
            {isPending && (
                <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-[2px] flex items-center justify-center rounded-lg">
                    <Spin tip="Đang xử lý phiếu kho..." size="large" />
                </div>
            )}

            <input type="file" accept=".xlsx, .xls, .csv" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />

            <Form form={form} layout="vertical" onFinish={onFinish} disabled={isPending}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="type" hidden><Input /></Form.Item>
                        <Form.Item name="userId" hidden><Input /></Form.Item>
                        <Form.Item name="reason" rules={[{ required: true, message: 'Lý do không được để trống!' }]}>
                            <Input label="Lý do *" placeholder={`VD: ${type === 'IMPORT' ? 'Nhập' : 'Xuất'} hàng tháng...`} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="supplierName"><Input label="Đối tác / Nhà cung cấp" placeholder="Tên công ty / Chi nhánh..." /></Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="note"><Input label="Ghi chú thêm" placeholder="Ghi chú nội bộ..." /></Form.Item>
                    </Col>
                </Row>

                <Card 
                    title={<span className="text-slate-700 font-semibold text-base">Danh sách sản phẩm</span>} 
                    size="small" className="bg-slate-50/50 border border-slate-200 mt-4 rounded-lg shadow-sm" bodyStyle={{ padding: '16px' }}
                >
                    <Form.List name="details">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.length === 0 && <Empty description="Chưa có sản phẩm nào. Vui lòng thêm!" className="my-8" />}
                                
                                {fields.map(({ key, name, ...restField }, index) => (
                                    <div key={key} className="bg-white p-4 mb-4 rounded-lg border border-slate-200 shadow-sm relative group transition-all hover:border-blue-300 hover:shadow-md">
                                        <div className="absolute top-3 right-3 z-10">
                                            <Tooltip title="Xóa dòng này">
                                                <Button 
                                                    type="button" variant="danger" size="sm" className="px-2 py-1 bg-red-50 text-red-500 border-none hover:bg-red-100 hover:text-red-700"
                                                    onClick={() => remove(name)} disabled={isPending}
                                                ><MinusCircleOutlined className="text-lg" /></Button>
                                            </Tooltip>
                                        </div>

                                        <Row gutter={16} className="pr-10"> 
                                            <Col span={10}>
                                                <Form.Item {...restField} name={[name, 'productVariantId']} label={<span className="font-medium text-slate-700">Sản phẩm *</span>} rules={[{ required: true, message: 'Chọn sản phẩm!' }]} className="mb-0">
                                                    <Select showSearch size="large" placeholder="Gõ tên hoặc SKU..." onSearch={handleSearchVariant} filterOption={false} notFoundContent={fetchingVariants ? <Spin size="small" /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không tìm thấy" />}>
                                                        {variantOptions.map(v => (
                                                            <Option key={v.id} value={v.id}>
                                                                <div className="font-medium">{v.productName}</div>
                                                                <div className="text-xs text-gray-400">SKU: {v.sku}</div>
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            </Col>

                                            <Col span={6}>
                                                <Form.Item {...restField} name={[name, 'quantity']} label={<span className="font-medium text-slate-700">Số lượng *</span>} rules={[{ required: true, message: 'Nhập SL!' }, { type: 'number', min: 1, message: 'Tối thiểu 1' }]} className="mb-0">
                                                    <InputNumber size="large" min={1} className="w-full" placeholder="0" onChange={() => form.validateFields([['details', name, 'serialNumbers']])} />
                                                </Form.Item>
                                            </Col>

                                            <Col span={8}>
                                                <Form.Item {...restField} name={[name, 'price']} label={<span className="font-medium text-slate-700">Đơn giá (VNĐ) *</span>} rules={[{ required: true, message: 'Nhập giá!' }]} className="mb-0">
                                                    <InputNumber size="large" min={0} className="w-full" placeholder="0" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/30 -mx-4 px-4 -mb-4 pb-4 rounded-b-lg">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center">
                                                    📦 Quản lý Serial / IMEI <span className="text-xs text-gray-400 font-normal ml-2 italic">(Tùy chọn)</span>
                                                </label>
                                                <Tooltip title="Upload file Excel (.xlsx, .csv). Hệ thống tự đọc Cột A.">
                                                    <Button type="button" variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50 py-1 h-auto" onClick={(e) => { e.preventDefault(); triggerExcelImport(index); }} disabled={isPending}>
                                                        <UploadOutlined className="mr-1" /> Nhập Excel
                                                    </Button>
                                                </Tooltip>
                                            </div>

                                            <Form.Item 
                                                {...restField} name={[name, 'serialNumbers']} className="mb-0" dependencies={[['details', name, 'quantity']]} 
                                                rules={[{
                                                    validator(_, value) {
                                                        const qty = form.getFieldValue(['details', name, 'quantity']) || 0;
                                                        const serialCount = value ? value.length : 0;
                                                        if (serialCount > 0 && serialCount !== qty) return Promise.reject(new Error(`Cảnh báo: Đã quét ${serialCount}/${qty} mã. Phải BẰNG số lượng!`));
                                                        if (value && value.some(v => String(v).trim() === '')) return Promise.reject(new Error('Phát hiện mã rỗng.'));
                                                        return Promise.resolve();
                                                    },
                                                }]}
                                            >
                                                <Select mode="tags" size="large" style={{ width: '100%' }} placeholder="Quét mã vạch vào đây..." open={false} tokenSeparators={[',', '\n', ' ']} className="inventory-serial-select" />
                                            </Form.Item>
                                        </div>
                                    </div>
                                ))}

                                <Form.Item className="mt-4 mb-0">
                                    <Button type="button" variant="outline" className="w-full border-dashed border-2 text-blue-600 bg-blue-50/50 hover:bg-blue-100/50 py-6" onClick={() => add({ quantity: 1, price: 0 })} disabled={isPending}>
                                        <PlusOutlined className="mr-2 text-lg" /> <span className="text-base font-medium">Thêm dòng sản phẩm mới</span>
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Card>

                <Form.Item shouldUpdate className="mt-6 !mb-0 relative z-20">
                    {() => {
                        const hasErrors = form.getFieldsError().some(({ errors }) => errors.length);
                        return (
                            <div className="flex justify-end gap-3">
                                <Button variant="secondary" onClick={onClose} disabled={isPending}>Hủy bỏ</Button>
                                <Button variant="primary" type="submit" loading={isPending} disabled={hasErrors || isPending}>LƯU & CHỐT PHIẾU</Button>
                            </div>
                        );
                    }}
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default InventoryFormModal;