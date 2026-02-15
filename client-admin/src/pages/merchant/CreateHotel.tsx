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
      message.success('Hotel created successfully!');
      navigate('/merchant');
    } catch (error) {
      message.error('Failed to create hotel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Create New Hotel">
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="name" label="Hotel Name" rules={[{ required: true }]}>
          <Input placeholder="e.g. Grand Hyatt" />
        </Form.Item>
        
        <Form.Item name="address" label="Address" rules={[{ required: true }]}>
          <Input placeholder="e.g. 123 Main St, Beijing" />
        </Form.Item>

        <Form.Item name="starRating" label="Star Rating" rules={[{ required: true }]}>
           <InputNumber min={1} max={5} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="description" label="Description">
           <TextArea rows={4} />
        </Form.Item>

        <Form.Item name="facilities" label="Facilities">
           <Select mode="tags" placeholder="Type and press enter (e.g. Wifi, Pool)">
               <Option value="Wifi">Wifi</Option>
               <Option value="Parking">Parking</Option>
               <Option value="Pool">Pool</Option>
               <Option value="Gym">Gym</Option>
           </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create Hotel
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateHotel;
