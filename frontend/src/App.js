import React from 'react';
import { Home, ShoppingCart, User } from 'lucide-react'; // Dùng thử icon đã cài

function App() {
  return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>🍼 Milk Store Project</h1>
        <p>Chào mừng bạn đến với cửa hàng sữa của Tiến!</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <Home size={32} color="blue" />
          <ShoppingCart size={32} color="green" />
          <User size={32} color="orange" />
        </div>
      </div>
  );
}

export default App;