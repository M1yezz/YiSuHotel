import React, { useState } from 'react';
import { Form, Input, Button, Card, message, InputNumber, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';

const { Option } = Select;
const { TextArea } = Input;

const CreateHotel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Format facilities if needed, but simple-array handles comma separated strings usually, 
      // or array of strings. Antd Select mode="tags" returns array of strings.
      await client.post('/hotels', values);
      message.success('酒店创建成功！');
      navigate('/merchant');
    } catch (error) {
      message.error('创建酒店失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="创建新酒店">
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="name" label="酒店名称" rules={[{ required: true }]}>
          <Input placeholder="例如：君悦酒店" />
        </Form.Item>
        
        <Form.Item name="address" label="地址" rules={[{ required: true }]}>
          <Input placeholder="例如：北京市朝阳区..." />
        </Form.Item>

        <Form.Item name="starRating" label="星级" rules={[{ required: true }]}>
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
          <Button type="primary" htmlType="submit" loading={loading}>
            创建酒店
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateHotel;
