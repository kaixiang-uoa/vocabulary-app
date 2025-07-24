import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { Layout, ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import './App.css';

// import page components
import HomePage from './pages/HomePage';
import UnitDetailPage from './pages/UnitDetailPage';
import ReviewPage from './pages/ReviewPage';

const { Content } = Layout;

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Layout className="app-layout">
          <Content className="app-content">
            <div className="container">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/unit/:unitId" element={<UnitDetailPage />} />
                <Route path="/review/:unitId" element={<ReviewPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Content>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
