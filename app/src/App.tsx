import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ClientLogin from './pages/client/ClientLogin';
import OpenTicket from './pages/client/OpenTicket';
import TrackTicket from './pages/client/TrackTicket';
import MyTickets from './pages/client/MyTickets';
import TicketDetail from './pages/client/TicketDetail';
import Login from './pages/employee/Login';
import Dashboard from './pages/employee/Dashboard';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/client/login" element={<ClientLogin />} />
          <Route path="/client/tickets" element={<MyTickets />} />
          <Route path="/client/ticket/detail" element={<TicketDetail />} />
          <Route path="/client/open" element={<OpenTicket />} />
          <Route path="/client/track" element={<TrackTicket />} />
          <Route path="/employee/login" element={<Login />} />
          <Route path="/employee/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
