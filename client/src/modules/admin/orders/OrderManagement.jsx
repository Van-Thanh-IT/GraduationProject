// File: src/modules/admin/orders/OrderManagement.jsx
import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, Search, SlidersHorizontal, 
  Printer, Loader2, Clock, Truck, CheckCircle2, XCircle 
} from 'lucide-react'; 
import { OrderDetailModal } from './components/OrderDetailModal';
import OrderTable from './components/OrderTable';
import { Button } from 'antd';

import { 
  useGetOrders, 
  useConfirmOrder, 
  usePackOrder, 
  useCancelOrder,
} from '@/hooks/useOrders';
import { useDownloadInvoice, usePrintDeliveryNotes } from '@/hooks/useExportFilePdf';
import { toast } from 'react-toastify';
import SEO from '@/components/SEO';

const STATUS_TABS = [
  { key: 'ALL', label: 'Tất cả đơn' },
  { key: 'PENDING', label: 'Chờ xác nhận' },
  { key: 'CONFIRMED', label: 'Chờ đóng gói' },
  { key:  'READY_TO_SHIP', label: 'Chờ lấy hàng' },
  { key: 'SHIPPING', label: 'Đang giao' },
  { key: 'COMPLETED', label: 'Hoàn thành' },
  { key: 'CANCELLED', label: 'Đã hủy' },
];

const OrderManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // STATE CHECKBOX
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedCodes, setSelectedCodes] = useState([]);

  const { data: orders = [], isLoading } = useGetOrders();
  const { mutate: confirmOrder, isPending: isConfirming } = useConfirmOrder();
  const { mutate: packOrder, isPending: isPacking } = usePackOrder();
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();
  
  const { mutateAsync: downloadInvoiceAsync } = useDownloadInvoice();
  const { mutate: printDeliveryNotes, isLoading: isPrinting } = usePrintDeliveryNotes();

  console.log(orders);

  const stats = useMemo(() => {
    let newOrders = 0, shipping = 0, completed = 0, cancelledOrReturned = 0;
    
    orders.forEach(order => {
      const st = order.orderStatus;
      if (st === 'PENDING' || st === 'CONFIRMED' || st === 'READY_TO_SHIP') newOrders++;
      else if (st === 'SHIPPING') shipping++;
      else if (st === 'COMPLETED') completed++;
      else if (st === 'CANCELLED' || st === 'RETURNED') cancelledOrReturned++;
    });

    return { newOrders, shipping, completed, cancelledOrReturned };
  }, [orders]);

  // ==========================================================
  // HANDLERS
  // ==========================================================
  const handleCancelOrder = (code, reason) => {
    cancelOrder({ code, reason }, {
      onSuccess: () => {
        toast.success('Đã hủy đơn hàng thành công!');
        setIsModalOpen(false); 
      },
      onError: (error) => toast.error(error.response?.data?.messages || 'Lỗi hủy đơn!')
    });
  };

  const handleConfirmOrder = (id) => {
    confirmOrder(id, {
      onSuccess: () => {
        toast.success('Đã xác nhận đơn hàng thành công!');
        setIsModalOpen(false); 
      },
      onError: (error) => toast.error(error.response?.data?.messages || 'Có lỗi xảy ra!')
    });
  };

  const handlePackOrder = (id, payload) => {
    packOrder({ id, payload }, {
      onSuccess: () => {
        toast.success('Đã chốt đóng gói thành công!');
        setIsModalOpen(false); 
      },
      onError: (error) => toast.error(error.response?.data?.messages || 'Có lỗi xảy ra!')
    });
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch = 
        order.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter === 'ALL' || order.orderStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const onSelectChange = (newSelectedRowKeys, selectedRows) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedCodes(selectedRows.map(row => row.code));
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  // LOGIC IN PHIẾU THÔNG MINH (IN TẤT CẢ HOẶC IN THEO LỰA CHỌN)
  const handlePrintSelected = () => {
    // Nếu có chọn checkbox thì lấy mã đã chọn, nếu không thì lấy TẤT CẢ mã đang hiển thị
    const codesToPrint = selectedCodes.length > 0 
      ? selectedCodes 
      : filteredOrders.map(order => order.code);

    if (codesToPrint.length === 0) {
      toast.warning('Không có đơn hàng nào để in!');
      return;
    }

    printDeliveryNotes(codesToPrint, {
       onSuccess: () => {
          toast.success(`Đã xuất phiếu giao hàng cho ${codesToPrint.length} đơn.`);
          setSelectedRowKeys([]); 
          setSelectedCodes([]);
       }
    });
  };  

  return (
    <>
      <SEO title='Quản lý đơn hàng' noIndex/>
      <div className=" bg-[#f8fafc] min-h-[calc(100vh-64px)] flex flex-col gap-2">
          {/* ================= 4 THẺ THỐNG KÊ (GIẢM PADDING & KHOẢNG CÁCH) ================= */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
              <div>
                <p className="textxs font-bold text-gray-500 mb-0.5">Cần xử lý mới</p>
                <h3 className="text-2xl font-black text-gray-800">{stats.newOrders}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock size={20} strokeWidth={2.5} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs font-bold text-gray-500 mb-0.5">Đang vận chuyển</p>
                <h3 className="text-2xl font-black text-gray-800">{stats.shipping}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Truck size={20} strokeWidth={2.5} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs font-bold text-gray-500 mb-0.5">Hoàn thành</p>
                <h3 className="text-2xl font-black text-gray-800">{stats.completed}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 size={20} strokeWidth={2.5} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs font-bold text-gray-500 mb-0.5">Hủy & Trả hàng</p>
                <h3 className="text-2xl font-black text-gray-800">{stats.cancelledOrReturned}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <XCircle size={20} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* ================= FILTER & CONTROL BAR (GOM GỌN KHÍT NHAU) ================= */}
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3">
            
            {/* Nhóm Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full xl:w-auto custom-scrollbar pb-1 xl:pb-0">
              {STATUS_TABS.map(tab => (
                <button
                  type="text"
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-2 py-1.5 rounded-lg text-[13px] font-bold whitespace-nowrap transition-all h-auto ${
                    statusFilter === tab.key 
                      ? 'bg-gray-900 text-white shadow-md hover:bg-gray-800 hover:text-white' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Nhóm Actions (Nút In + Tìm kiếm) */}
            <div className="flex items-center gap-2 w-full xl:w-auto">
              
              {/* NÚT IN LUÔN HIỂN THỊ */}
              <Button 
                onClick={handlePrintSelected}
                loading={isPrinting}
                icon={!isPrinting && <Printer size={15} />}
                className="flex items-center gap-1.5 px-3 py-2 h-auto bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white rounded-lg text-[13px] font-bold transition-all shrink-0 shadow-sm !hover:border-blue-600 !hover:bg-blue-600"
              >
                In Phiếu {selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : '(Tất cả)'}
              </Button>

              {/* Thanh tìm kiếm */}
              <div className="relative w-full xl:w-full shrink-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={15} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm mã đơn, tên, SĐT..."
                  className="w-64 pl-9 pr-9 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-[13px] transition-all outline-none font-medium shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

          </div>

          {/* ================= TABLE COMPONENT ================= */}
          <OrderTable 
            data={filteredOrders} 
            loading={isLoading} 
            onView={(order) => { setSelectedOrder(order); setIsModalOpen(true); }}
            onDownloadInvoice={(orderId) => downloadInvoiceAsync(orderId)}
            rowSelection={rowSelection} 
          />

          {/* ================= MODAL CHI TIẾT ================= */}
          <OrderDetailModal
            isOpen={isModalOpen}
            order={selectedOrder}
            onClose={() => setIsModalOpen(false)}
            onCancelOrder={handleCancelOrder}
            onConfirmOrder={handleConfirmOrder} 
            onPackOrder={handlePackOrder}       
            isConfirming={isConfirming}
            isPacking={isPacking}
            isCancelling={isCancelling}
          />
      </div>
    </>
  );
};

export default OrderManagement;