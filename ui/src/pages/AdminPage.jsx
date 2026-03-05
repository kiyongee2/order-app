import AdminDashboard from '../components/AdminDashboard';
import InventoryStatus from '../components/InventoryStatus';
import OrderStatus from '../components/OrderStatus';
import './AdminPage.css';

function AdminPage({ orders, inventory, onChangeOrderStatus, onUpdateInventory }) {
  const dashboardStats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'received').length,
    inProgressOrders: orders.filter(o => o.status === 'in_progress').length,
    completedOrders: orders.filter(o => o.status === 'completed').length
  };

  // 진행 중인 주문만 표시 (접수/제조 중)
  const activeOrders = orders.filter(o => o.status === 'received' || o.status === 'in_progress');

  return (
    <div className="admin-page">
      <AdminDashboard stats={dashboardStats} />
      <InventoryStatus inventory={inventory} onUpdateInventory={onUpdateInventory} />
      <OrderStatus 
        orders={activeOrders} 
        onChangeOrderStatus={onChangeOrderStatus}
      />
    </div>
  );
}

export default AdminPage;
