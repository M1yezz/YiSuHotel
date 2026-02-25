import React, { useEffect, useState } from 'react';
import { Table, Tag, message, Image, Card } from 'antd';
import client from '../../api/client';

const MyAds: React.FC = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState<any[]>([]);

  useEffect(() => {
    fetchHotelsAndAds();
  }, []);

  const fetchHotelsAndAds = async () => {
      setLoading(true);
      try {
          const hotelRes = await client.get('/hotels/my');
          const myHotels = hotelRes.data || [];
          setHotels(myHotels);

          const allAds: any[] = [];
          for (const hotel of myHotels) {
              try {
                  const adRes = await client.get(`/banners/hotel/${hotel.id}`);
                  if (adRes.data) {
                      allAds.push(...adRes.data);
                  }
              } catch (e) {

              }
          }
          allAds.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setAds(allAds as never[]);
      } catch (error) {
          message.error('加载数据失败');
      } finally {
          setLoading(false);
      }
  };

  const columns = [
    { 
        title: '广告图片', 
        dataIndex: 'imageUrl', 
        key: 'imageUrl',
        render: (url: string) => <Image src={url} width={100} height={50} style={{ objectFit: 'cover' }} />
    },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { 
        title: '所属酒店', 
        dataIndex: 'hotelId', 
        key: 'hotelId',
        render: (id: number) => hotels.find(h => h.id === id)?.name || id
    },
    { 
        title: '投放时间', 
        key: 'duration', 
        render: (_: any, record: any) => (
            <span>{record.startDate} 至 {record.endDate}</span>
        )
    },
    { 
        title: '审核状态', 
        dataIndex: 'status', 
        key: 'status',
        render: (status: string) => {
            let color = 'orange';
            let text = '审核中';
            if (status === 'approved') { color = 'green'; text = '已通过'; }
            if (status === 'rejected') { color = 'red'; text = '未通过'; }
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
  ];

  return (
    <Card title="我的广告">
      <Table dataSource={ads} columns={columns} loading={loading} rowKey="id" />
    </Card>
  );
};

export default MyAds;
