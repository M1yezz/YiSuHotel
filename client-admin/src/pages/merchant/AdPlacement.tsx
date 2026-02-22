import React, { useState, useEffect } from 'react';
import { Card, Form, DatePicker, Upload, Button, message, InputNumber, Alert, Divider, Select, Modal } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import client from '../../api/client';
import locale from 'antd/es/date-picker/locale/zh_CN';

const { RangePicker } = DatePicker;

const AdPlacement: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hotels, setHotels] = useState<any[]>([]);

  useEffect(() => {
      fetchHotels();
  }, []);

  const fetchHotels = async () => {
      try {
          const res = await client.get('/hotels/my');
          setHotels(res.data || []);
      } catch (error) {
          console.error(error);
          message.error('获取酒店列表失败');
      }
  };

  const onDateChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      const start = dates[0];
      const end = dates[1];
      // Calculate days difference (inclusive of start and end date? usually yes for ads)
      // If start=24, end=24, is it 1 day? Yes.
      const days = end.diff(start, 'day') + 1;
      setDuration(days);
      setTotalPrice(days * 500);
    } else {
      setDuration(0);
      setTotalPrice(0);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append('file', file);
      try {
          const response = await client.post('/upload', formData, {
              headers: {
                  'Content-Type': 'multipart/form-data',
              },
          });
          return response.data.url;
      } catch (error) {
          console.error('Upload failed:', error);
          throw error;
      }
  };

  const onFinish = async (values: any) => {
    if (fileList.length === 0) {
        message.error('请上传广告图片');
        return;
    }
    
    setLoading(true);
    try {
        // Upload image
        let imageUrl = '';
        if (fileList[0].originFileObj) {
            imageUrl = await uploadFile(fileList[0].originFileObj as File);
        } else if (fileList[0].url) {
            imageUrl = fileList[0].url;
        }

        const payload = {
            imageUrl,
            title: values.title || '首页轮播广告',
            hotelId: values.hotelId,
            startDate: values.dateRange[0].format('YYYY-MM-DD'),
            endDate: values.dateRange[1].format('YYYY-MM-DD'),
            isActive: true,
            order: 100 // High priority for paid ads
        };

        await client.post('/banners', payload);
        Modal.success({
            title: '投放申请已提交',
            content: (
                <div>
                    <p>您的广告投放申请已提交审核。</p>
                    <p>预估费用：¥{totalPrice}</p>
                    <p>请在“我的广告”页面查看审核进度。</p>
                </div>
            ),
            onOk: () => {
                form.resetFields();
                setFileList([]);
                setTotalPrice(0);
                setDuration(0);
            }
        });
    } catch (error) {
        console.error(error);
        message.error('投放失败，请重试');
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
    <Card title="投放广告 (首页轮播图)">
      <Alert
        message="广告投放说明"
        description="您可以上传图片投放到小程序首页轮播图中。计费标准：¥500/天。广告到期后将自动下架。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ title: '新店开业大酬宾' }}
      >
        <Form.Item label="选择酒店" name="hotelId" rules={[{ required: true, message: '请选择要推广的酒店' }]}>
            <Select placeholder="请选择酒店">
                {hotels.map(hotel => (
                    <Select.Option key={hotel.id} value={hotel.id}>{hotel.name}</Select.Option>
                ))}
            </Select>
        </Form.Item>

        <Form.Item label="广告图片" required tooltip="建议尺寸：750x300，支持jpg/png">
            <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                beforeUpload={() => false}
                maxCount={1}
            >
                {fileList.length >= 1 ? null : uploadButton}
            </Upload>
        </Form.Item>

        <Form.Item 
            name="dateRange" 
            label="投放日期" 
            rules={[{ required: true, message: '请选择投放日期' }]}
        >
            <RangePicker 
                locale={locale} 
                style={{ width: '100%' }} 
                onChange={onDateChange}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
        </Form.Item>

        {duration > 0 && (
            <div style={{ background: '#f9f9f9', padding: 16, borderRadius: 8, marginBottom: 24 }}>
                <p>投放时长：<span style={{ fontWeight: 'bold', fontSize: 16 }}>{duration}</span> 天</p>
                <p>预估费用：<span style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: 24 }}>¥{totalPrice}</span></p>
                <p style={{ color: '#999', fontSize: 12 }}>（单价：¥500/天）</p>
            </div>
        )}

        <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
                立即投放 {totalPrice > 0 ? `(¥${totalPrice})` : ''}
            </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AdPlacement;
