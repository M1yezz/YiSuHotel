import React, { useState } from 'react';
import { View } from '@tarojs/components';
import { Field, Button, CellGroup } from '@antmjs/vantui';
import Taro from '@tarojs/taro';
import client from '../../api/client';
import './index.scss';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Default to user, maybe add selector later

  const onRegister = async () => {
    if (!username || !password) {
      Taro.showToast({ title: 'Please fill all fields', icon: 'none' });
      return;
    }
    try {
      await client.post('/auth/register', { username, password, role });
      Taro.showToast({ title: 'Register Success', icon: 'success' });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View className='register-container'>
      <View className='title'>创建账户</View>
      <CellGroup>
        <Field
          value={username}
          label="用户名"
          placeholder="请输入用户名"
          onChange={(e) => setUsername(e.detail)}
        />
        <Field
          value={password}
          type="password"
          label="密码"
          placeholder="请输入密码"
          onChange={(e) => setPassword(e.detail)}
        />
      </CellGroup>
      <View className='actions'>
        <Button type="primary" block onClick={onRegister}>注册</Button>
      </View>
    </View>
  );
};

export default Register;
