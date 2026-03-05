import { useState } from 'react';
import './App.css';
import Header from './components/Header';
import OrderPage from './pages/OrderPage';
import AdminPage from './pages/AdminPage';

function App() {
  const [currentPage, setCurrentPage] = useState('ordering');
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([
    { id: 1, name: '아메리카노(ICE)', stock: 10 },
    { id: 2, name: '아메리카노(HOT)', stock: 3 },
    { id: 3, name: '카페라떼', stock: 0 }
  ]);

  const handleAddOrder = (cartItems, totalPrice) => {
    const newOrder = {
      id: Date.now(),
      items: cartItems,
      totalPrice: totalPrice,
      status: 'received',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setOrders([...orders, newOrder]);
  };

  const handleChangeOrderStatus = (orderId) => {
    setOrders(
      orders.map(order =>
        order.id === orderId
          ? { ...order, status: 'in_progress', updatedAt: new Date() }
          : order
      )
    );
  };

  const handleUpdateInventory = (menuId, newStock) => {
    setInventory(
      inventory.map(item =>
        item.id === menuId ? { ...item, stock: newStock } : item
      )
    );
  };

  return (
    <div className="app">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="main-container">
        {currentPage === 'ordering' ? (
          <OrderPage onAddOrder={handleAddOrder} />
        ) : (
          <AdminPage 
            orders={orders}
            inventory={inventory}
            onChangeOrderStatus={handleChangeOrderStatus}
            onUpdateInventory={handleUpdateInventory}
          />
        )}
      </div>
    </div>
  );
}

export default App;
