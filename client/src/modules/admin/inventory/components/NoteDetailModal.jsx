import React from 'react';
import { Modal, Typography, Row, Col, Tag } from 'antd';
import moment from 'moment';
import CustomTable from '@/components/ui/CustomTable';
import Button from '@/components/ui/Button';

const { Title, Text } = Typography;

const NoteDetailModal = ({ visible, onClose, note, onViewHistory }) => {
    if (!note) return null;

    const detailColumns = [
        { title: 'ID SP', dataIndex: 'productVariantId', width: 80 },
        { title: 'Số lượng', dataIndex: 'quantity', render: (q) => <Text strong>{q}</Text> },
        { title: 'Đơn giá', dataIndex: 'price', render: (p) => `${p?.toLocaleString('vi-VN')} đ` },
        {
            title: 'Mã Serial / IMEI', dataIndex: 'serialNumbers', width: '35%', render: (serials) => (
                <div className="flex flex-wrap gap-1">
                    {serials?.length > 0 ? serials.map(sn => <Tag color="cyan" key={sn}>{sn}</Tag>) : <Text type="secondary" italic>Không quản lý IMEI</Text>}
                </div>
            )
        },
        {
            title: 'Thao tác', align: 'center', width: 120, render: (_, record) => (
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
            width={850}
        >
            <div className="flex flex-col gap-4 mt-4">
                <Row gutter={16} className="bg-slate-50 p-4 rounded-md border border-slate-200">
                    <Col span={12}>
                        <p><b>Loại phiếu:</b> <Tag color={note.type === 'IMPORT' ? 'blue' : 'orange'}>{note.type}</Tag></p>
                        <p><b>Lý do:</b> {note.reason}</p>
                        <p><b>Ghi chú:</b> {note.note || '---'}</p>
                    </Col>
                    <Col span={12}>
                        <p><b>Đối tác:</b> {note.supplierName || '---'}</p>
                        <p><b>Tổng tiền:</b> <Text type="success" strong>{note.totalAmount?.toLocaleString('vi-VN')} đ</Text></p>
                        <p><b>Ngày tạo:</b> {moment(note.createdAt).format('DD/MM/YYYY HH:mm:ss')}</p>
                    </Col>
                </Row>

                <Title level={5} className="mt-4">Danh sách sản phẩm</Title>
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