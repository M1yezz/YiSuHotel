import React from 'react';
import { Layout, Menu, MenuProps } from 'antd';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import HotelList from './merchant/HotelList';
import CreateHotel from './merchant/CreateHotel';

const { Header, Content, Sider } = Layout;

const MerchantDashboard: React.FC = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const items: MenuProps['items'] = [
        {
            key: '1',
            label: <Link to="/merchant">我的酒店</Link>,
        },
        {
            key: '2',
            label: <Link to="/merchant/create">创建酒店</Link>,
        },
        {
            key: '3',
            label: '退出登录',
            onClick: handleLogout,
        },
    ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']} items={items} />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0 }} />
        <Content style={{ margin: '16px' }}>
          <Routes>
            <Route path="/" element={<HotelList />} />
            <Route path="/create" element={<CreateHotel />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};
export default MerchantDashboard;

