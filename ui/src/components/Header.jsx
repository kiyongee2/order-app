import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <h1>COZY</h1>
        </div>
        <nav className="nav-tabs">
          <button className="nav-tab active">주문하기</button>
          <button className="nav-tab">관리자</button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
