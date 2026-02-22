import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, message, Space, Image, Modal } from 'antd';
import client from '../../api/client';

const BannerAuditList: React.FC = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [currentBannerId, setCurrentBannerId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/banners/admin');
      setBanners(data);
    } catch (error) {
      message.error('加载广告列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAudit = async (id: number, status: 'approved' | 'rejected', reason?: string) => {
      try {
          await client.patch(`/banners/${id}/audit`, { status, reason });
          message.success('操作成功');
          fetchBanners();
          setRejectModalVisible(false);
          setRejectReason('');
      } catch (error) {
          message.error('操作失败');
      }
  };

  const openRejectModal = (id: number) => {
      setCurrentBannerId(id);
      setRejectModalVisible(true);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { 
        title: '广告图片', 
        dataIndex: 'imageUrl', 
        key: 'imageUrl',
        render: (url: string) => (
            <Image 
                src={url} 
                width={100} 
                height={50} 
                style={{ objectFit: 'cover', cursor: 'pointer' }}
                preview={{ visible: false }}
                onClick={() => {
                    setPreviewImage(url);
                    setPreviewOpen(true);
                }}
            />
        )
    },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { 
        title: '关联酒店ID', 
        dataIndex: 'hotelId', 
        key: 'hotelId',
        render: (id: number) => id || '-'
    },
    { 
        title: '投放时间', 
        key: 'duration', 
        render: (_: any, record: any) => (
            <span>{record.startDate} 至 {record.endDate}</span>
        )
    },
    { 
        title: '状态', 
        dataIndex: 'status', 
        key: 'status',
        render: (status: string) => {
            let color = 'orange';
            let text = '审核中';
            if (status === 'approved') { color = 'green'; text = '已通过'; }
            if (status === 'rejected') { color = 'red'; text = '已拒绝'; }
            return <Tag color={color}>{text}</Tag>;
        }
    },
    { 
        title: '拒绝原因', 
        dataIndex: 'auditReason', 
        key: 'auditReason',
        render: (text: string, record: any) => record.status === 'rejected' ? <span style={{color: 'red'}}>{text}</span> : '-'
    },
    { 
        title: '显示中', 
        dataIndex: 'isActive', 
        key: 'isActive',
        render: (isActive: boolean) => isActive ? <Tag color="blue">是</Tag> : <Tag>否</Tag>
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
            {record.status === 'pending' && (
                <>
                    <Button type="primary" size="small" onClick={() => handleAudit(record.id, 'approved')}>通过</Button>
                    <Button danger size="small" onClick={() => openRejectModal(record.id)}>拒绝</Button>
                </>
            )}
            {record.status === 'approved' && record.isActive && (
                 <Button danger size="small" onClick={() => handleAudit(record.id, 'rejected')}>下架</Button>
            )}
            {record.status === 'rejected' && (
                 <Button type="primary" ghost size="small" onClick={() => handleAudit(record.id, 'approved')}>重新上架</Button>
            )}
        </Space>
      ),
    },
  ];

  return (
      <div style={{ background: '#fff', padding: 24 }}>
          <h2>广告审核管理</h2>
          <Table dataSource={banners} columns={columns} loading={loading} rowKey="id" />
          
          <Image
            width={200}
            style={{ display: 'none' }}
            src={previewImage}
            preview={{
              visible: previewOpen,
              onVisibleChange: (visible) => {
                 setPreviewOpen(visible);
                 if (!visible) setPreviewImage('');
              },
            }}
          />

          <Modal
            title="拒绝原因"
            open={rejectModalVisible}
            onOk={() => currentBannerId && handleAudit(currentBannerId, 'rejected', rejectReason)}
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

export default BannerAuditList;
