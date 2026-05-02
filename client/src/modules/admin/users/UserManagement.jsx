
import { Tabs } from 'antd';
import CustomerList from './components/CustomerList';
import StaffList from './components/StaffList';

export default function UserManagement() {
  const items = [
    {
      key: '1',
      label: 'Khách hàng',
      children: <CustomerList />,
    },
    {
      key: '2',
      label: 'Nhân viên',
      children: <StaffList />,
    },
  ];

  return (
    <div className="p-2 bg-white rounded-lg shadow-sm">
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
}