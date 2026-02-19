import React, { useState } from 'react';
import { Form, Input, Button, Card, message, InputNumber, Select, DatePicker, Upload, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import locale from 'antd/es/date-picker/locale/zh_CN';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';

dayjs.locale('zh-cn');

const { Option } = Select;
const { TextArea } = Input;

// 模拟上传函数（实际项目中应替换为真实上传接口）
// 暂时返回一个占位图或 base64
const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const CreateHotel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // 门店照片 (单张)
  const [fileListStore, setFileListStore] = useState<UploadFile[]>([]);
  // 宣传照片 (多张)
  const [fileListImages, setFileListImages] = useState<UploadFile[]>([]);

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  };

  const handleChangeStore: UploadProps['onChange'] = ({ fileList: newFileList }) =>
    setFileListStore(newFileList);

  const handleChangeImages: UploadProps['onChange'] = ({ fileList: newFileList }) =>
    setFileListImages(newFileList);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // 获取上传后的图片 URL (这里为了演示，如果未接入后端上传接口，可以使用 base64 或 mock url)
      // 假设 fileList 中已经有了 url (如果上传成功) 或者我们需要传 base64 给后端
      
      const storeImgUrl = fileListStore.length > 0 
          ? (fileListStore[0].url || fileListStore[0].thumbUrl || await getBase64(fileListStore[0].originFileObj as File)) 
          : '';
          
      const imagesUrls = await Promise.all(fileListImages.map(async file => {
          return file.url || file.thumbUrl || await getBase64(file.originFileObj as File);
      }));

      const payload = {
          ...values,
          openingDate: values.openingDate ? values.openingDate.format('YYYY-MM-DD') : undefined,
          storeImg: storeImgUrl,
          images: imagesUrls,
      };
      
      const { data } = await client.post('/hotels', payload);
      message.success('酒店创建成功，请添加房型！');
      navigate(`/merchant/hotels/${data.id}/rooms`);
    } catch (error) {
      console.error(error);
      message.error('创建酒店失败');
    } finally {
      setLoading(false);
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传</div>
    </div>
  );

  return (
    <Card title="创建新酒店 (第一层: 基础信息)">
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="name" label="酒店名称" rules={[{ required: true, message: '请输入酒店名称' }]}>
          <Input placeholder="例如：君悦酒店" />
        </Form.Item>
        
        <Form.Item name="address" label="地址" rules={[{ required: true, message: '请输入酒店地址' }]}>
          <Input placeholder="例如：北京市朝阳区..." />
        </Form.Item>

        <Form.Item name="openingDate" label="开业日期" rules={[{ required: true, message: '请选择开业日期' }]}>
           <DatePicker style={{ width: '100%' }} placeholder="选择开业日期" locale={locale} />
        </Form.Item>

        <Form.Item label="门店照片" required tooltip="请上传一张门店封面图">
           <Upload
              listType="picture-card"
              fileList={fileListStore}
              onPreview={handlePreview}
              onChange={handleChangeStore}
              beforeUpload={() => false} // 阻止自动上传，改为手动随表单提交
              maxCount={1}
              accept="image/*"
            >
              {fileListStore.length >= 1 ? null : uploadButton}
            </Upload>
        </Form.Item>

        <Form.Item label="宣传照片" required tooltip="请上传多张酒店宣传图">
           <Upload
              listType="picture-card"
              fileList={fileListImages}
              onPreview={handlePreview}
              onChange={handleChangeImages}
              beforeUpload={() => false}
              accept="image/*"
              multiple
            >
              {fileListImages.length >= 8 ? null : uploadButton}
            </Upload>
        </Form.Item>

        <Form.Item name="starRating" label="星级" rules={[{ required: true, message: '请选择酒店星级' }]}>
           <InputNumber min={1} max={5} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="description" label="描述">
           <TextArea rows={4} />
        </Form.Item>

        <Form.Item name="facilities" label="设施">
           <Select mode="tags" placeholder="输入并回车（例如：Wifi, 泳池）">
               <Option value="Wifi">无线网络</Option>
               <Option value="Parking">停车场</Option>
               <Option value="Pool">游泳池</Option>
               <Option value="Gym">健身房</Option>
           </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            下一步：保存并管理房型
          </Button>
        </Form.Item>
      </Form>
      
      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </Card>
  );
};

export default CreateHotel;
