import React, { useEffect, useState } from 'react';
import { View, Image, Text } from '@tarojs/components';
import { Search, Button, Tabs, Tab, Icon, Empty, Tag } from '@antmjs/vantui';
import Taro, { useDidShow } from '@tarojs/taro';
import client from '../../api/client';
import './index.scss';

const Index: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Mock dates for display
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formatDate = (date: Date) => `${date.getMonth() + 1}月${date.getDate()}日`;

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res: any = await client.get('/hotels', { keyword: keyword });
      setHotels(res || []);
    } catch (err) {
      console.error(err);
      Taro.showToast({ title: 'Failed to load hotels', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);
  
  useDidShow(() => {
      // Refresh if needed
  });

  const onSearch = () => {
    fetchHotels();
  };

  const goToDetail = (id: number) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` });
  };

  return (
    <View className='index'>
      <View className='banner-bg' />
      
      <View className='search-card'>
        <Tabs active={activeTab} onChange={(e) => setActiveTab(e.detail.index)}>
          <Tab title='国内' />
          <Tab title='海外' />
          <Tab title='民宿' />
          <Tab title='钟点房' />
        </Tabs>

        <View className='location-row'>
          <View className='city'>
            镇江 <Icon name="arrow-down" size="12px" style={{ marginLeft: 4 }} />
          </View>
          <View className='current-location' onClick={() => {}}>
            <Icon name="aim" size="16px" color="#1989fa" style={{ marginRight: 4 }} />
            <Text>我的位置</Text>
          </View>
        </View>

        <View className='search-input-row' style={{ padding: '10px 0', borderBottom: '1px solid #ebedf0' }}>
          <Search
            value={keyword}
            placeholder='位置/品牌/酒店'
            onChange={(e) => setKeyword(e.detail)}
            onSearch={onSearch}
            background='#fff'
            shape='round'
          />
        </View>

        <View className='date-row'>
          <View className='date-item'>
            <Text className='label'>入住</Text>
            <View className='date-val'>
              {formatDate(today)}<Text className='weekday'>今天</Text>
            </View>
          </View>
          <View className='duration'>共1晚</View>
          <View className='date-item'>
            <Text className='label'>离店</Text>
            <View className='date-val'>
              {formatDate(tomorrow)}<Text className='weekday'>明天</Text>
            </View>
          </View>
        </View>

        <View className='guest-row'>
          <Text>1间房 1成人 0儿童</Text>
          <Text className='placeholder'>价格/星级</Text>
        </View>

        <View className='tags-row'>
          <View className='tag'>西津渡历史文化街区</View>
          <View className='tag'>市中心/西津渡</View>
          <View className='tag'>双床房</View>
        </View>

        <Button className='search-btn' type='danger' onClick={onSearch}>
          查询
        </Button>
      </View>

      <View className='hotel-list'>
        {loading ? (
            <View className='loading'>Loading...</View>
        ) : hotels.length > 0 ? (
          hotels.map(hotel => (
            <View key={hotel.id} className='hotel-card' onClick={() => goToDetail(hotel.id)}>
              <Image 
                className='thumb'
                src={hotel.images?.[0] || 'https://img.yzcdn.cn/vant/ipad.jpeg'}
                mode='aspectFill'
              />
              <View className='content'>
                <View className='title-row'>
                    <Text className='name'>{hotel.name}</Text>
                </View>
                
                <View className='score-row'>
                    <View className='score-badge'>4.6</View>
                    <Text className='score-text'>很好</Text>
                    <Text className='reviews'>195 reviews</Text>
                </View>

                <View className='location-info'>
                    {hotel.address}
                </View>

                <View className='tags-info'>
                    <View className='feature-tag'>免费停车</View>
                    <View className='feature-tag'>健身房</View>
                </View>

                <View className='price-row'>
                    <Text className='price-symbol'>¥</Text>
                    <Text className='price-val'>{hotel.rooms?.[0]?.price || 'N/A'}</Text>
                    <Text className='price-suffix'>起</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <Empty description="未找到酒店" />
        )}
      </View>
    </View>
  );
};

export default Index;
