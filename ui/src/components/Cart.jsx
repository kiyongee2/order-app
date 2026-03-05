import './Cart.css';

function Cart({ items, totalPrice, onRemoveItem, onOrder }) {
  const handleOrder = () => {
    if (items.length === 0) {
      alert('장바구니에 상품을 추가해주세요.');
      return;
    }
    if (onOrder) {
      onOrder();
    }
  };

  return (
    <div className="cart-section">
      <h2>장바구니</h2>
      
      {items.length === 0 ? (
        <p className="empty-cart">장바구니가 비어있습니다.</p>
      ) : (
        <div className="cart-container">
          <div className="cart-items-section">
            <div className="cart-items">
              {items.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-details">
                    <p className="item-name">
                      {item.menuName}
                      {item.options.shot && ' (샷 추가)'}
                      {item.options.syrup && ' (시럽 추가)'}
                    </p>
                    <p className="item-price">
                      {(item.basePrice + item.optionPrice).toLocaleString()}원 x {item.quantity}
                    </p>
                  </div>
                  <div className="item-subtotal">
                    {((item.basePrice + item.optionPrice) * item.quantity).toLocaleString()}원
                  </div>
                  <button 
                    className="remove-button"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="cart-summary-section">
            <div className="summary-box">
              <div className="total-section">
                <span className="total-label">총액</span>
                <span className="total-amount">{totalPrice.toLocaleString()}원</span>
              </div>
              <button className="order-button" onClick={handleOrder}>주문하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
