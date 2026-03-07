import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Feed from './pages/Feed'
import CreateListing from './pages/CreateListing'
import ProductDetail from './pages/ProductDetail'
import MyListings from './pages/MyListings'
import Profile from './pages/Profile'
import EditListing from './pages/EditListing'
import PrivacyPolicy from './pages/PrivacyPolicy'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Feed />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sell"
              element={
                <ProtectedRoute>
                  <CreateListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/product/:id"
              element={
                <ProtectedRoute>
                  <ProductDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit/:id"
              element={
                <ProtectedRoute>
                  <EditListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-listings"
              element={
                <ProtectedRoute>
                  <MyListings />
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
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
