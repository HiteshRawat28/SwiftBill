import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<div>Inventory (Phase 3)</div>} />
          <Route path="parties" element={<div>Parties (Phase 4)</div>} />
          <Route path="invoices" element={<div>Invoices (Phase 6)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
