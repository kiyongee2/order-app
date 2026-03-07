import { useState } from 'react';
import MenuGrid from '../components/MenuGrid';
import Cart from '../components/Cart';
import './OrderPage.css';

const menuData = [
  {
    id: 1,
    name: '아메리카노(ICE)',
    price: 4000,
    description: '상큼한 맛의 차가운 아메리카노',
    image: '🧊'
  },
  {
    id: 2,
    name: '아메리카노(HOT)',
    price: 4000,
    description: '따뜻한 아메리카노',
    image: '☕'
  },
  {
    id: 3,
    name: '카페라떼',
    price: 5000,
    description: '부드러운 우유의 맛',
    image: '🥛'
  },
  {
    id: 4,
    name: '카푸치노',
    price: 5000,
    description: '풍부한 거품의 카푸치노',
    image: '🫧'
  },
  {
    id: 5,
    name: '에스프레소',
    price: 3500,
    description: '진한 맛의 에스프레소',
    image: '💪'
  },
  {
    id: 6,
    name: '모카',
    price: 5500,
    description: '초콜릿 향의 모카',
    image: '🍫'
  }
];

function OrderPage({ onAddOrder }) {
  const [cart, setCart] = useState([]);
  const [currentMenu, setCurrentMenu] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});

  const handleAddToCart = (menu, options) => {
    const existingItemIndex = cart.findIndex(
      item =>
        item.menuId === menu.id &&
        JSON.stringify(item.options) === JSON.stringify(options)
    );

    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      const newItem = {
        id: Date.now(),
        menuId: menu.id,
        menuName: menu.name,
        basePrice: menu.price,
        options: options,
        optionPrice: calculateOptionPrice(options),
        quantity: 1
      };
      setCart([...cart, newItem]);
    }
    
    setCurrentMenu(null);
    setSelectedOptions({});
  };

  const calculateOptionPrice = (options) => {
    let price = 0;
    if (options.shot) price += 500;
    if (options.syrup) price += 0;
    return price;
  };

  const handleRemoveFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      return total + (item.basePrice + item.optionPrice) * item.quantity;
    }, 0);
  };

  const handleOrder = async () => {
    if (cart.length === 0) {
      alert('장바구니에 상품을 추가해주세요.');
      return;
    }
    await onAddOrder(cart, getTotalPrice());
    alert(`${cart.length}개의 상품을 주문했습니다.\n총액: ${getTotalPrice().toLocaleString()}원`);
    setCart([]);
    setSelectedOptions({});
  };

  return (
    <div className="order-page">
      <MenuGrid 
        menus={menuData} 
        onSelectMenu={setCurrentMenu}
        currentMenu={currentMenu}
        selectedOptions={selectedOptions}
        onOptionsChange={setSelectedOptions}
        onAddToCart={handleAddToCart}
      />
      <Cart 
        items={cart} 
        totalPrice={getTotalPrice()}
        onRemoveItem={handleRemoveFromCart}
        onOrder={handleOrder}
      />
    </div>
  );
}

export default OrderPage;
