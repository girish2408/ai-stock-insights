import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/index.jsx';
import HowItWorksPage from './pages/HowItWorks.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
      </Routes>
    </BrowserRouter>
  );
}

