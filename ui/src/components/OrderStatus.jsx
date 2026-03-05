import './OrderStatus.css';

function OrderStatus({ orders, onChangeOrderStatus }) {
  const formatDate = (date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${month}월 ${day}일 ${hours}:${minutes}`;
  };

  const getStatusLabel = (status) => {
    if (status === 'received') return '주문 접수';
    if (status === 'in_progress') return '제조 중';
    return '알 수 없음';
  };

  const getButtonLabel = (status) => {
    if (status === 'received') return '제조 시작';
    return '제조 완료';
  };

  return (
    <div className="order-status-section">
      <h2>주문 현황</h2>
      
      {orders.length === 0 ? (
        <p className="no-orders">진행 중인 주문이 없습니다.</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-item">
              <div className="order-header">
                <span className="order-date">{formatDate(order.createdAt)}</span>
                <span className={`order-status status-${order.status}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              
              <div className="order-details">
                <div className="order-items">
                  {order.items.map((item, idx) => (
                    <p key={idx} className="order-item-detail">
                      {item.menuName} 
                      {item.options.shot && ' (샷 추가)'}
                      {item.options.syrup && ' (시럽 추가)'}
                      {' × ' + item.quantity}
                    </p>
                  ))}
                </div>
                
                <div className="order-footer">
                  <span className="order-price">
                    {order.totalPrice.toLocaleString()}원
                  </span>
                  <button 
                    className="order-action-btn"
                    onClick={() => onChangeOrderStatus(order.id)}
                  >
                    {getButtonLabel(order.status)}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderStatus;
