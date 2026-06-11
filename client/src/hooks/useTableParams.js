import { useState } from 'react';

export const useTableParams = (initialParams = {}) => {
  const [params, setParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    ...initialParams,
  });

  const handleTableChange = (pagination, filters, sorter) => {
    setParams({
      pagination: pagination,
      filters: filters,
      sortField: sorter.field,
      sortOrder: sorter.order,
    });
  };

  const resetPagination = () => {
    setParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        current: 1, 
      },
    }));
  };

  return {
    params,
    setParams,
    handleTableChange,
    resetPagination,
  };
};