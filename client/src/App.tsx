import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ChatPage from './pages/ChatPage';
import DiscoverPage from './pages/DiscoverPage';
import RequestsPage from './pages/RequestsPage';
import ProfilePage from './pages/ProfilePage';
import ChatDetailPage from './pages/ChatDetailPage';
import CallingPage from './pages/CallingPage';
import MainLayout from './components/MainLayout';
import { useAuthStore } from './store/useAuthStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  return token ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<ChatPage />} />
          <Route path="/chat/:friendId" element={<ChatDetailPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/call" element={<CallingPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
