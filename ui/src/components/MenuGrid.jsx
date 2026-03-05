import MenuCard from './MenuCard';
import './MenuGrid.css';

function MenuGrid({ menus, onSelectMenu, selectedOptions, onOptionsChange, onAddToCart }) {
  return (
    <div className="menu-section">
      <h2>메뉴</h2>
      <div className="menu-grid">
        {menus.map(menu => (
          <MenuCard
            key={menu.id}
            menu={menu}
            onSelectMenu={onSelectMenu}
            selectedOptions={selectedOptions}
            onOptionsChange={onOptionsChange}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
}

export default MenuGrid;
