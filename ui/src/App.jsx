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

  const handleAddOrder = async (cartItems, totalPrice) => {
    try {
      // 백엔드 API 형식에 맞게 데이터 변환
      const orderData = {
        items: cartItems.map(item => {
          const options = [];
          // 샷이 추가된 경우: 각 메뉴의 첫 번째 옵션이 '샷 추가'
          if (item.options.shot) {
            options.push(item.menuId * 2 - 1); // menuId별로 옵션 ID 계산
          }
          // 시럽이 추가된 경우: 각 메뉴의 두 번째 옵션이 '시럽 추가'
          if (item.options.syrup) {
            options.push(item.menuId * 2);
          }
          
          return {
            menuId: item.menuId,
            quantity: item.quantity,
            options: options
          };
        }),
        notes: null
      };

      // 백엔드 API 호출
      const response = await fetch('http://localhost:5001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '주문 생성 실패');
      }

      const result = await response.json();
      
      // 응답 데이터로 상태 업데이트
      const newOrder = {
        id: result.data.id,
        items: cartItems,
        totalPrice: result.data.total_price,
        status: result.data.status,
        createdAt: new Date(result.data.created_at),
        updatedAt: new Date(result.data.updated_at)
      };
      setOrders([...orders, newOrder]);
    } catch (error) {
      console.error('주문 생성 오류:', error);
      alert('주문 생성에 실패했습니다. 다시 시도해주세요.');
    }
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
