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
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
    { title: 'Star', dataIndex: 'starRating', key: 'starRating' },
    { 
        title: 'Status', 
        dataIndex: 'status', 
        key: 'status',
        render: (status: string) => (
            <Tag color={status === 'published' ? 'green' : status === 'rejected' ? 'red' : 'orange'}>
                {status.toUpperCase()}
            </Tag>
        )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Button type="link">Edit</Button>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 24 }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>My Hotels</h2>
            <Button type="primary" onClick={() => window.location.href = '/merchant/create'}>Add New Hotel</Button>
        </div>
        <Table dataSource={hotels} columns={columns} loading={loading} rowKey="id" />
    </div>
  );
};

export default HotelList;
