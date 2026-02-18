import React from 'react';
import { Form, Input, Button, Card, message, Select } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';

const Register: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      await register(values);
      message.success('注册成功，请登录');
      navigate('/login');
    } catch (error) {
      message.error('注册失败');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card title="注册" style={{ width: 400 }}>
        <Form onFinish={onFinish}>
          <Form.Item name="username" rules={[{ required: true }]}>
            <Input placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true }]}>
            <Input.Password placeholder="密码" />
          </Form.Item>
          <Form.Item name="role" initialValue="merchant" rules={[{ required: true }]}>
             <Select>
                 <Select.Option value="merchant">商户</Select.Option>
                 <Select.Option value="admin">管理员</Select.Option>
             </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              注册
            </Button>
            <div style={{ marginTop: 10, textAlign: 'center' }}>
                <Link to="/login">返回登录</Link>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
