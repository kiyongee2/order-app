import { useState } from 'react';
import './MenuCard.css';

function MenuCard({ menu, onSelectMenu, selectedOptions, onOptionsChange, onAddToCart }) {
  const [localOptions, setLocalOptions] = useState({
    shot: false,
    syrup: false
  });

  const handleOptionChange = (option) => {
    const newOptions = {
      ...localOptions,
      [option]: !localOptions[option]
    };
    setLocalOptions(newOptions);
    onOptionsChange(newOptions);
  };

  const handleAddClick = () => {
    onAddToCart(menu, localOptions);
    setLocalOptions({ shot: false, syrup: false });
  };

  const getOptionPrice = () => {
    let price = 0;
    if (localOptions.shot) price += 500;
    if (localOptions.syrup) price += 0;
    return price;
  };

  const totalPrice = menu.price + getOptionPrice();

  return (
    <div className="menu-card">
      <div className="menu-image">
        <img 
          src={`/${menu.image_url}`} 
          alt={menu.name}
          className="menu-image-item"
          onError={(e) => { e.target.src = '/vite.svg'; }}
        />
      </div>
      <div className="menu-info">
        <h3 className="menu-name">{menu.name}</h3>
        <p className="menu-price">{menu.price.toLocaleString()}원</p>
        <p className="menu-description">{menu.description}</p>
        
        <div className="options">
          <label className="option-item">
            <input 
              type="checkbox" 
              checked={localOptions.shot}
              onChange={() => handleOptionChange('shot')}
            />
            <span>샷 추가 (+500원)</span>
          </label>
          <label className="option-item">
            <input 
              type="checkbox" 
              checked={localOptions.syrup}
              onChange={() => handleOptionChange('syrup')}
            />
            <span>시럽 추가 (+0원)</span>
          </label>
        </div>

        <div className="menu-footer">
          <span className="total-price">{totalPrice.toLocaleString()}원</span>
          <button className="add-button" onClick={handleAddClick}>담기</button>
        </div>
      </div>
    </div>
  );
}

export default MenuCard;
