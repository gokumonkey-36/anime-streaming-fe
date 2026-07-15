import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { AnimeDetailsPage } from './pages/AnimeDetailsPage';
import { SearchPage } from './pages/SearchPage';
import { MyListPage } from './pages/MyListPage';
import { AuthPage } from './pages/AuthPage';
import { WatchPage } from './pages/WatchPage';
import { CategoryListPage } from './pages/CategoryListPage';
import { NewsPage } from './pages/NewsPage';
import './index.css';

function AppLayout() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/anime/:id" element={<AnimeDetailsPage />} />
        <Route path="/watch/:id" element={<WatchPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/mylist" element={<MyListPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/list/:category" element={<CategoryListPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppLayout />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
