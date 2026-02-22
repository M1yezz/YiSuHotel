import React from 'react';
import { Layout, Menu, MenuProps, Avatar, Dropdown } from 'antd';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { 
    ShopOutlined, 
    PlusCircleOutlined, 
    LogoutOutlined, 
    UserOutlined,
    NotificationOutlined
} from '@ant-design/icons';
import AdPlacement from './merchant/AdPlacement';
import MyAds from './merchant/MyAds';
import HotelList from './merchant/HotelList';
import CreateHotel from './merchant/CreateHotel';
import RoomList from './merchant/RoomList';

const { Header, Content, Sider } = Layout;

const MerchantDashboard: React.FC = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username') || '商户';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const items: MenuProps['items'] = [
        {
            key: '1',
            icon: <ShopOutlined />,
            label: <Link to="/merchant">我的酒店</Link>,
        },
        {
            key: '2',
            icon: <PlusCircleOutlined />,
            label: <Link to="/merchant/create">创建酒店</Link>,
        },
        {
            key: '4',
            icon: <NotificationOutlined />,
            label: <Link to="/merchant/ad-placement">投放广告</Link>,
        },
        {
            key: '5',
            icon: <NotificationOutlined />,
            label: <Link to="/merchant/my-ads">我的广告</Link>,
        },
        {
            key: '3',
            icon: <LogoutOutlined />,
            label: '退出登录',
            onClick: handleLogout,
        },
    ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible width={240} theme="light" style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: '24px 24px', color: '#333', fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: 8 }}>🏨</span> 易宿酒店
        </div>
        <Menu 
            theme="light" 
            mode="inline" 
            defaultSelectedKeys={['1']} 
            items={items} 
            style={{ borderRight: 0, fontSize: '18px' }} 
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#87d068', marginRight: 8 }} />
                <span style={{ fontSize: '16px', fontWeight: 500 }}>{username}</span>
            </div>
        </Header>
        <Content style={{ margin: '16px' }}>
          <Routes>
            <Route path="/" element={<HotelList />} />
            <Route path="/create" element={<CreateHotel />} />
            <Route path="/ad-placement" element={<AdPlacement />} />
            <Route path="/my-ads" element={<MyAds />} />
            <Route path="/hotels/:id/rooms" element={<RoomList />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};
export default MerchantDashboard;

