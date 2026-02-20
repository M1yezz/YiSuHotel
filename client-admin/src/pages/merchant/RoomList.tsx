import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Card, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';

// 模拟上传函数
const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const RoomList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [hotel, setHotel] = useState<any>(null);

  // 图片上传相关
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  useEffect(() => {
    fetchHotelAndRooms();
  }, [id]);

  const fetchHotelAndRooms = async () => {
    setLoading(true);
    try {
      const { data } = await client.get(`/hotels/${id}`);
      setHotel(data);
      setRooms(data.rooms || []);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = async (values: any) => {
    try {
      // 获取图片
      const imageUrl = fileList.length > 0 
          ? (fileList[0].url || fileList[0].thumbUrl || await getBase64(fileList[0].originFileObj as File)) 
          : '';

      const newRoom = { 
        ...values, 
        roomImg: imageUrl,
        price: Number(values.price),
        stock: Number(values.stock)
      };
      
      // 注意：这里需要确保 newRooms 里的旧数据结构也是完整的，或者至少包含 id
      // 如果后端 update 逻辑是直接替换 rooms，那么需要小心
      // TypeORM 的 cascade: true 通常会处理好新增和更新
      const newRooms = [...rooms, newRoom];
      
      await client.patch(`/hotels/${id}`, { rooms: newRooms });
      message.success('房型添加成功');
      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
      fetchHotelAndRooms();
    } catch (error) {
      message.error('添加房型失败');
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传</div>
    </div>
  );

  const columns = [
    { title: '房型名称', dataIndex: 'title', key: 'title' },
    { title: '价格', dataIndex: 'price', key: 'price' },
    { title: '库存', dataIndex: 'stock', key: 'stock' },
    {
      title: '图片',
      dataIndex: 'roomImg',
      key: 'roomImg',
      render: (text: string) => text ? <img src={text} alt="room" style={{ height: 40 }} /> : '无',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button danger type="link">删除</Button>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 24 }}>
        <div style={{ marginBottom: 16 }}>
            <Button onClick={() => navigate('/merchant')}>返回酒店列表</Button>
        </div>
        <Card title={`管理房型 - ${hotel?.name || ''}`}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="primary" onClick={() => setIsModalVisible(true)}>添加新房型</Button>
            </div>
            <Table dataSource={rooms} columns={columns} rowKey="id" loading={loading} />
        </Card>

        <Modal
            title="添加房型"
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            onOk={() => form.submit()}
            okText="确认"
            cancelText="取消"
        >
            <Form form={form} layout="vertical" onFinish={handleAddRoom}>
                <Form.Item name="title" label="房型名称" rules={[{ required: true }]}>
                    <Input placeholder="例如：豪华大床房" />
                </Form.Item>
                <Form.Item name="price" label="价格" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
                <Form.Item name="stock" label="库存" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
                 <Form.Item label="房型图片">
                    <Upload
                      listType="picture-card"
                      fileList={fileList}
                      onPreview={handlePreview}
                      onChange={handleChange}
                      beforeUpload={() => false}
                      maxCount={1}
                    >
                      {fileList.length >= 1 ? null : uploadButton}
                    </Upload>
                </Form.Item>
            </Form>
        </Modal>

        <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
            <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
    </div>
  );
};

export default RoomList;