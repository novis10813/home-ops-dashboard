import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ApiKeys from './pages/ApiKeys';
import Ports from './pages/Ports';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="api-keys" element={<ApiKeys />} />
          <Route path="ports" element={<Ports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
