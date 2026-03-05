import { useState } from 'react';
import './InventoryStatus.css';

function InventoryStatus({ inventory, onUpdateInventory }) {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const getStockStatus = (stock) => {
    if (stock === 0) return { status: '품절', className: 'status-soldout' };
    if (stock < 5) return { status: '주의', className: 'status-warning' };
    return { status: '정상', className: 'status-normal' };
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setEditValue(item.stock.toString());
  };

  const handleSave = (id) => {
    let newStock = parseInt(editValue) || 0;
    // 음수 값 방지
    if (newStock < 0) {
      alert('재고 수량은 0 이상이어야 합니다.');
      return;
    }
    onUpdateInventory(id, newStock);
    setEditingId(null);
  };

  const handleIncrement = (id, currentStock) => {
    onUpdateInventory(id, currentStock + 1);
  };

  const handleDecrement = (id, currentStock) => {
    if (currentStock > 0) {
      onUpdateInventory(id, currentStock - 1);
    } else {
      alert('재고가 이미 0입니다.');
    }
  };

  return (
    <div className="inventory-section">
      <h2>재고 현황</h2>
      <div className="inventory-grid">
        {inventory.map(item => {
          const stockStatus = getStockStatus(item.stock);
          return (
            <div key={item.id} className="inventory-card">
              <h3 className="inventory-name">{item.name}</h3>
              
              <div className="inventory-info">
                {editingId === item.id ? (
                  <div className="inventory-edit">
                    <input
                      type="number"
                      min="0"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="inventory-input"
                    />
                    <button 
                      onClick={() => handleSave(item.id)}
                      className="save-button"
                    >
                      저장
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="stock-display">
                      <span className="stock-number">{item.stock}개</span>
                      <span className={`stock-status ${stockStatus.className}`}>
                        {stockStatus.status}
                      </span>
                    </div>
                    <div className="inventory-controls">
                      <button 
                        className="control-btn minus-btn"
                        onClick={() => handleDecrement(item.id, item.stock)}
                        disabled={item.stock === 0}
                      >
                        −
                      </button>
                      <button 
                        className="control-btn plus-btn"
                        onClick={() => handleIncrement(item.id, item.stock)}
                      >
                        +
                      </button>
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditClick(item)}
                      >
                        수정
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InventoryStatus;
