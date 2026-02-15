import React from 'react';
import { Form, Input, Button, Card, message, Select } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';

const Register: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      await register(values);
      message.success('Registration successful, please login');
      navigate('/login');
    } catch (error) {
      message.error('Registration failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card title="Register" style={{ width: 400 }}>
        <Form onFinish={onFinish}>
          <Form.Item name="username" rules={[{ required: true }]}>
            <Input placeholder="Username" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true }]}>
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item name="role" initialValue="merchant" rules={[{ required: true }]}>
             <Select>
                 <Select.Option value="merchant">Merchant</Select.Option>
                 <Select.Option value="admin">Admin</Select.Option>
             </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Register
            </Button>
            <div style={{ marginTop: 10, textAlign: 'center' }}>
                <Link to="/login">Back to Login</Link>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
