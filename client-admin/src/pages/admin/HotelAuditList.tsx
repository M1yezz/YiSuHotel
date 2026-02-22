import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, message, Modal, Space } from 'antd';
import client from '../../api/client';

const HotelAuditList: React.FC = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [currentHotelId, setCurrentHotelId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

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

  const handleAudit = async (id: number, status: 'published' | 'rejected' | 'offline', reason?: string) => {
      try {
          await client.patch(`/hotels/${id}/audit`, { status, reason });
          message.success('操作成功');
          fetchHotels();
          setRejectModalVisible(false);
          setRejectReason('');
      } catch (error) {
          message.error('操作失败');
      }
  };

  const openRejectModal = (id: number) => {
      setCurrentHotelId(id);
      setRejectModalVisible(true);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '商户', dataIndex: ['merchant', 'username'], key: 'merchant' },
    { 
        title: '状态', 
        dataIndex: 'status', 
        key: 'status',
        render: (status: string) => {
            let color = 'orange';
            let text = '审核中';
            if (status === 'published') { color = 'green'; text = '已通过'; }
            if (status === 'rejected') { color = 'red'; text = '不通过'; }
            if (status === 'offline') { color = 'default'; text = '已下线'; }
            return <Tag color={color}>{text}</Tag>;
        }
    },
    { 
        title: '原因', 
        dataIndex: 'auditReason', 
        key: 'auditReason',
        render: (text: string, record: any) => record.status === 'rejected' ? <span style={{color: 'red'}}>{text}</span> : '-'
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
                    <Button danger size="small" onClick={() => openRejectModal(record.id)}>拒绝</Button>
                </>
            )}
            {record.status === 'published' && (
                 <Button danger size="small" onClick={() => handleAudit(record.id, 'offline')}>下线</Button>
            )}
            {record.status === 'offline' && (
                 <Button type="primary" ghost size="small" onClick={() => handleAudit(record.id, 'published')}>重新上线</Button>
            )}
            {record.status === 'rejected' && (
                 <Button type="primary" ghost size="small" onClick={() => handleAudit(record.id, 'published')}>重新通过</Button>
            )}
        </Space>
      ),
    },
  ];

  return (
      <div style={{ background: '#fff', padding: 24 }}>
          <h2>酒店审核管理</h2>
          <Table dataSource={hotels} columns={columns} loading={loading} rowKey="id" />

          <Modal
            title="拒绝原因"
            open={rejectModalVisible}
            onOk={() => currentHotelId && handleAudit(currentHotelId, 'rejected', rejectReason)}
            onCancel={() => setRejectModalVisible(false)}
          >
              <textarea 
                  rows={4} 
                  style={{ width: '100%', padding: 8 }} 
                  placeholder="请输入拒绝原因"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
              />
          </Modal>
      </div>
  );
};

export default HotelAuditList;
