import React, { useState } from 'react';
import { View } from '@tarojs/components';
import { Field, Button, CellGroup, Toast } from '@antmjs/vantui';
import Taro from '@tarojs/taro';
import client from '../../api/client';
import './index.scss';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    if (!username || !password) {
      Taro.showToast({ title: '请填写所有字段', icon: 'none' });
      return;
    }
    try {
      const res: any = await client.post('/auth/login', { username, password });
      if (res.access_token) {
        Taro.setStorageSync('token', res.access_token);
        Taro.setStorageSync('user', JSON.stringify(res.user));
        Taro.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => {
            Taro.navigateBack();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const goToRegister = () => {
    Taro.navigateTo({ url: '/pages/register/index' });
  };

  return (
    <View className='login-container'>
      <View className='title'>欢迎回来</View>
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
        <Button type="primary" block onClick={onLogin}>登录</Button>
        <Button type="default" block onClick={goToRegister} style={{ marginTop: 10 }}>注册</Button>
      </View>
      <Toast id="van-toast" />
    </View>
  );
};

export default Login;
