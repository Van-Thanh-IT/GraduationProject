import React, { useState} from 'react';
import { Table } from 'antd';

const CustomTable = ({
  columns = [],
  dataSource = [],
  loading = false,
  total = 0,
  showPagination = true,
  rowKey = 'id',
  onChange,
  ...restProps 
}) => {

  const [internalPagination, setInternalPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // 2. Handle internal changes
  const handleTableChange = (pagination, filters, sorter, extra) => {
    setInternalPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });

    if (onChange) {
      onChange(pagination, filters, sorter, extra);
    }
  };

  const paginationConfig = showPagination ? {
    current: internalPagination.current,
    pageSize: internalPagination.pageSize,
    total: total || dataSource.length,
    showSizeChanger: true,
    pageSizeOptions: ['5', '10', '25', '50', '100', '200', '1000'],
    showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} / ${total} bản ghi`,
    locale: { items_per_page: '/ trang' },
  } : false;

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      pagination={paginationConfig}
      onChange={handleTableChange}
      scroll={dataSource.length > 0 ? { x: 'max-content', y: 300 } : undefined}
      bordered
      size="middle"
      rowKey={rowKey}
      sticky={{ offsetHeader: 0 }}
      locale={{ emptyText: 'Không có dữ liệu' }}
      {...restProps}
    />
  );
};

export default CustomTable;