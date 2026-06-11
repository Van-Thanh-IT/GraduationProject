import React from 'react';
import { Modal, Typography, Row, Col, Tag } from 'antd';
import moment from 'moment';
import CustomTable from '@/components/ui/CustomTable';
import Button from '@/components/ui/Button';

const { Title, Text } = Typography;

const NoteDetailModal = ({ visible, onClose, note, onViewHistory }) => {
    if (!note) return null;

    const detailColumns = [
        { 
            title: 'Sản phẩm', 
            dataIndex: 'productName',
            render: (text, record) => (
                <div className="flex flex-col">
                    <Text strong>{text}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        SKU: {record.sku} {record.variantAttributes ? `| ${record.variantAttributes}` : ''}
                    </Text>
                </div>
            )
        },
        { 
            title: 'Số lượng', 
            dataIndex: 'quantity', 
            width: 90, 
            align: 'center', 
            render: (q) => <Text strong>{q}</Text> 
        },
        { 
            title: 'Đơn giá', 
            dataIndex: 'price', 
            width: 120, 
            render: (p) => `${p?.toLocaleString('vi-VN')} đ` 
        },
        {
            title: 'Mã Serial / IMEI', 
            dataIndex: 'serials', 
            width: '35%', 
            render: (serials) => (
                <div className="flex flex-wrap gap-1">
                    {serials?.length > 0 ? (
                        serials.map(s => (
                            // Kiểm tra status ở đây: nếu SOLD thì đỏ, ngược lại thì màu cyan (xanh)
                            <Tag 
                                color={s.status === 'SOLD' ? 'red' : 'cyan'} 
                                key={s.serialNumber}
                            >
                                {s.serialNumber}
                            </Tag>
                        ))
                    ) : (
                        <Text type="secondary" italic>Không quản lý IMEI</Text>
                    )}
                </div>
            )
        },
        {
            title: 'Thao tác', 
            align: 'center', 
            width: 100, 
            render: (_, record) => (
                <Button variant="outline" size="sm" onClick={() => onViewHistory(record.productVariantId)}>
                    Xem log
                </Button>
            )
        }
    ];

    return (
        <Modal
            title={`Chi tiết phiếu: ${note.code || ''}`}
            open={visible}
            onCancel={onClose}
            footer={[<Button key="close" variant="secondary" onClick={onClose}>Đóng</Button>]}
            width={900} 
        >
            <div className="flex flex-col gap-4 mt-4">
                <Row gutter={16} className="bg-slate-50 p-4 rounded-md border border-slate-200">
                    <Col span={12}>
                        <p className="mb-2"><b>Loại phiếu:</b> <Tag color={note.type === 'IMPORT' ? 'blue' : 'orange'} className="ml-1">{note.type}</Tag></p>
                        <p className="mb-2"><b>Lý do:</b> {note.reason}</p>
                        <p className="mb-0"><b>Ghi chú:</b> {note.note || '---'}</p>
                    </Col>
                    <Col span={12}>
                        <p className="mb-2"><b>Đối tác:</b> {note.supplierName || '---'}</p>
                        <p className="mb-2"><b>Tổng tiền:</b> <Text type="success" strong className="ml-1">{note.totalAmount?.toLocaleString('vi-VN')} đ</Text></p>
                        <p className="mb-0"><b>Ngày tạo:</b> {moment(note.createdAt).format('DD/MM/YYYY HH:mm:ss')}</p>
                    </Col>
                </Row>

                <Title level={5} className="mt-4 mb-2">Danh sách sản phẩm</Title>
                <CustomTable
                    columns={detailColumns}
                    dataSource={note.details} 
                    rowKey="id"
                    showPagination={false}
                    scroll={{ y: 350 }}
                />
            </div>
        </Modal>
    );
};

export default NoteDetailModal;