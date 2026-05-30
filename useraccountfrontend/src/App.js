import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import Navbar from './components/common/Navbar';
import RegistrationPage from './components/auth/RegistrationPage';
import ProfilePage from './components/userspage/ProfilePage';
import AdminOrdersPage from './components/userspage/AdminOrderPage';
import AdminOrderReportPage from './components/orderreport/AdminOrderReportPage';
import AdminDashboard from './components/dashboard/AdminDashBoard';
import AdminDrinks from './components/admindrinkpage/AdminDrinks';
import LedControl from './components/LedPage/LedControlPage';
import DhtShowPage from './components/DhtPage/DhtShowPage';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <div className="content">
          <Routes>
            <Route exact path="/" element={<LoginPage />} />
            <Route exact path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/order-report" element={<AdminOrderReportPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/drinks" element={<AdminDrinks />} />
            <Route path="/admin/led" element={<LedControl />} />
            <Route path="/admin/dht" element={<DhtShowPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;