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
      message.error('加载酒店列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAudit = async (id: number, status: 'published' | 'rejected') => {
      try {
          await client.patch(`/hotels/${id}/audit`, { status });
          message.success('操作成功');
          fetchHotels();
      } catch (error) {
          message.error('操作失败');
      }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '商户', dataIndex: ['merchant', 'username'], key: 'merchant' },
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
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', render: (val: string) => new Date(val).toLocaleDateString() },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
            {record.status === 'pending' && (
                <>
                    <Button type="primary" size="small" onClick={() => handleAudit(record.id, 'published')}>通过</Button>
                    <Button danger size="small" onClick={() => handleAudit(record.id, 'rejected')}>拒绝</Button>
                </>
            )}
            {record.status === 'published' && (
                 <Button danger size="small" onClick={() => handleAudit(record.id, 'offline')}>下架</Button>
            )}
        </Space>
      ),
    },
  ];

  return (
      <div style={{ background: '#fff', padding: 24 }}>
          <h2>酒店审核管理</h2>
          <Table dataSource={hotels} columns={columns} loading={loading} rowKey="id" />
      </div>
  );
};

export default HotelAuditList;
