import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, message, Modal, Space } from 'antd';
import client from '../../api/client';

const HotelAuditList: React.FC = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/hotels/admin');
      setHotels(data);
    } catch (error) {
      message.error('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleAudit = async (id: number, status: 'published' | 'rejected') => {
      try {
          await client.patch(`/hotels/${id}/audit`, { status });
          message.success(`Hotel ${status} successfully`);
          fetchHotels();
      } catch (error) {
          message.error('Operation failed');
      }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Merchant', dataIndex: ['merchant', 'username'], key: 'merchant' },
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
    { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt', render: (val: string) => new Date(val).toLocaleDateString() },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
            {record.status === 'pending' && (
                <>
                    <Button type="primary" size="small" onClick={() => handleAudit(record.id, 'published')}>Approve</Button>
                    <Button danger size="small" onClick={() => handleAudit(record.id, 'rejected')}>Reject</Button>
                </>
            )}
            {record.status === 'published' && (
                 <Button danger size="small" onClick={() => handleAudit(record.id, 'offline')}>Offline</Button>
            )}
        </Space>
      ),
    },
  ];

  return (
      <div style={{ background: '#fff', padding: 24 }}>
          <h2>Hotel Audit Management</h2>
          <Table dataSource={hotels} columns={columns} loading={loading} rowKey="id" />
      </div>
  );
};

export default HotelAuditList;
