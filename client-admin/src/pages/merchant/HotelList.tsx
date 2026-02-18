import React, { useEffect, useState } from 'react';
import { Table, Button, Tag } from 'antd';
import client from '../../api/client';

const HotelList: React.FC = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/hotels/my');
      setHotels(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '地址', dataIndex: 'address', key: 'address' },
    { title: '星级', dataIndex: 'starRating', key: 'starRating' },
    { 
        title: '状态', 
        dataIndex: 'status', 
        key: 'status',
        render: (status: string) => (
            <Tag color={status === 'published' ? 'green' : status === 'rejected' ? 'red' : 'orange'}>
                {status.toUpperCase()}
            </Tag>
        )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button type="link">编辑</Button>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 24 }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>我的酒店</h2>
            <Button type="primary" onClick={() => window.location.href = '/merchant/create'}>添加新酒店</Button>
        </div>
        <Table dataSource={hotels} columns={columns} loading={loading} rowKey="id" />
    </div>
  );
};

export default HotelList;
