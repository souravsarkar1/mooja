import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ChatPage from './pages/chat/ChatPage';
import { useAuthStore } from './store/useAuthStore';
import Feed from './pages/feeds/Feed';
import FooterNavbar from './components/FooterNavbar';
import SearchPage from './pages/Search/Search';
import Reels from './pages/reels/Reels';
import Profile from './pages/profile/Profile';
import SingleProfile from './pages/profile/SingleProfile';
import AvailableChatFriend from './pages/chat/AvailableChatFriend';
import { Toaster } from 'sonner';
import CreatePage from './pages/create/CreatePage';
import { useEffect } from 'react';
import { logEvent } from 'firebase/analytics';
import { analytics } from './firebase';
import EditProfile from './pages/profile/EditProfile';
import FriendRequestToMe from './pages/profile/FriendRequestToMe';
import FriendRequestsSendByMe from './pages/profile/FriendRequestsSendByMe';


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  return token ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {


  useEffect(()=>{
    logEvent(analytics, "app_initialized", {
      platform : "web"
    })
  },[])
  return (
    <div>
      <Toaster position="top-center" duration={2000} />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <AvailableChatFriend />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:id"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <ProtectedRoute>
                <SingleProfile />
              </ProtectedRoute>
            }
          />

          <Route
          path='/profile/friend-requests'
          element={
            <ProtectedRoute>
              <FriendRequestToMe/>
            </ProtectedRoute>
          }
          />
          <Route
          path='/profile/friend-requests-by-me'
          element={
            <ProtectedRoute>
              <FriendRequestsSendByMe/>
            </ProtectedRoute>
          }
          />
          <Route
          path='/profile/edit-profile'
          element={
            <ProtectedRoute>
              <EditProfile/>
            </ProtectedRoute>
          }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reels"
            element={
              <ProtectedRoute>
                <Reels />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreatePage />
              </ProtectedRoute>
            }
          />
        </Routes>
        <FooterNavbar />
      </Router>
    </div>
  );
}
