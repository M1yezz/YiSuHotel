import React, { useEffect, useState } from 'react';
import { View, Image, Text, Swiper, SwiperItem } from '@tarojs/components';
import { Search, Button, Tabs, Tab, Icon, Empty, Calendar, Popup, Field, Cell, CellGroup, Stepper } from '@antmjs/vantui';
import Taro, { useDidShow, useReachBottom } from '@tarojs/taro';
import client from '../../api/client';
import './index.scss';

const Index: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Banner Data
  const [banners, setBanners] = useState<any[]>([
      { id: 1, imageUrl: 'https://img.yzcdn.cn/vant/apple-1.jpg', hotelId: 1 },
      { id: 2, imageUrl: 'https://img.yzcdn.cn/vant/apple-2.jpg', hotelId: 2 },
      { id: 3, imageUrl: 'https://img.yzcdn.cn/vant/apple-3.jpg', hotelId: 3 }
  ]);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Date Selection
  const [showCalendar, setShowCalendar] = useState(false);
  const defaultStartDate = new Date();
  const defaultEndDate = new Date();
  defaultEndDate.setDate(defaultEndDate.getDate() + 1);
  const [dateRange, setDateRange] = useState<[Date, Date]>([defaultStartDate, defaultEndDate]);

  // Guest Selection
  const [showGuestPopup, setShowGuestPopup] = useState(false);
  const [guestCount, setGuestCount] = useState(1);
  const [roomCount, setRoomCount] = useState(1);

  // City & Location
  const [city, setCity] = useState('');
  const [showCityPopup, setShowCityPopup] = useState(false);
  const cityList = ['全部', '镇江', '南京', '上海', '北京', '苏州', '杭州'];

  const formatDate = (date: Date) => `${date.getMonth() + 1}月${date.getDate()}日`;
  const getDayDiff = (d1: Date, d2: Date) => {
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

  const fetchHotels = async (isRefresh = false) => {
    if (loading || (!hasMore && !isRefresh)) return;
    setLoading(true);
    try {
      const currentPage = isRefresh ? 1 : page;
      // Note: Backend currently might not support pagination fully, assuming standard limit/offset or similar
      const queryParams: any = {
        page: currentPage,
        limit: 10
      };
      
      if (keyword) queryParams.keyword = keyword;
      if (city && city !== '全部') queryParams.city = city;

      const res: any = await client.get('/hotels', queryParams);
      
      // Mocking pagination response structure if backend returns array directly
      const newHotels = Array.isArray(res) ? res : (res.data || []);
      
      if (isRefresh) {
        setHotels(newHotels);
        setPage(2);
      } else {
        setHotels(prev => [...prev, ...newHotels]);
        setPage(prev => prev + 1);
      }
      
      if (newHotels.length < 10) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

    } catch (err) {
      console.error(err);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const fetchBanners = async () => {
      try {
          const res: any = await client.get('/banners');
          if (res && res.length > 0) {
              setBanners(res);
          }
      } catch (err) {
          console.error('Failed to fetch banners', err);
      }
  };

  useEffect(() => {
    fetchHotels(true);
    fetchBanners();
  }, []); // Initial load

  useReachBottom(() => {
    fetchHotels();
  });

  const onSearch = () => {
    setHasMore(true);
    fetchHotels(true);
  };

  const goToDetail = (id: number) => {
    // Pass params via URL
    const params = `?id=${id}&startDate=${dateRange[0].getTime()}&endDate=${dateRange[1].getTime()}&guestCount=${guestCount}&roomCount=${roomCount}`;
    Taro.navigateTo({ url: `/pages/detail/index${params}` });
  };

  const onConfirmDate = (event: any) => {
    // Vant Weapp Calendar 'range' type returns an array of dates in event.detail
    // Sometimes it might be wrapped differently depending on version
    let dates = event.detail;
    if (!Array.isArray(dates) && dates.value) {
        dates = dates.value;
    }
    
    if (Array.isArray(dates) && dates.length >= 2) {
        const start = new Date(dates[0]);
        const end = new Date(dates[1]);
        setDateRange([start, end]);
    }
    setShowCalendar(false);
  };

  const onSelectCity = (c: string) => {
    setCity(c);
    setShowCityPopup(false);
    fetchHotels(true);
  };

  const getLocation = () => {
    Taro.getLocation({
      type: 'wgs84',
      success: function (res) {
        // Here normally we would reverse geocode coordinates to city name
        // For now, mock setting it to '当前位置' or keep '镇江' but show toast
        Taro.showToast({ title: '定位成功', icon: 'success' });
        // Mock city change for demo
        // setCity('南京'); 
      },
      fail: function () {
        Taro.showToast({ title: '定位失败', icon: 'none' });
      }
    });
  };

  return (
    <View className='index'>
      <Swiper
        className='top-banner-swiper'
        indicatorColor='#999'
        indicatorActiveColor='#fff'
        circular
        indicatorDots
        autoplay
      >
        {banners.map((item, index) => (
          <SwiperItem key={index} onClick={() => goToDetail(item.hotelId)}>
            <Image src={item.imageUrl} className='banner-img' mode='aspectFill' />
          </SwiperItem>
        ))}
      </Swiper>
      
      <View className='search-card'>
        <Tabs active={activeTab} onChange={(e) => setActiveTab(e.detail.index)}>
          <Tab title='国内' />
          <Tab title='海外' />
          <Tab title='民宿' />
          <Tab title='钟点房' />
        </Tabs>

        <View className='location-row'>
          <View className='city' onClick={() => setShowCityPopup(true)}>
            {city || '全部'} <Icon name="arrow-down" size="12px" style={{ marginLeft: 4 }} />
          </View>
          <View className='current-location' onClick={getLocation}>
            <Icon name="aim" size="16px" color="#1989fa" style={{ marginRight: 4 }} />
            <Text>我的位置</Text>
          </View>
        </View>

        <View className='search-input-row'>
          <Search
            value={keyword}
            placeholder='位置/品牌/酒店'
            onChange={(e) => setKeyword(e.detail)}
            onSearch={onSearch}
            background='#fff'
            shape='round'
          />
        </View>

        <View className='date-row' onClick={() => setShowCalendar(true)}>
          <View className='date-item'>
            <Text className='label'>入住</Text>
            <View className='date-val'>
              {formatDate(dateRange[0])}<Text className='weekday'></Text>
            </View>
          </View>
          <View className='duration'>共{getDayDiff(dateRange[0], dateRange[1])}晚</View>
          <View className='date-item'>
            <Text className='label'>离店</Text>
            <View className='date-val'>
              {formatDate(dateRange[1])}<Text className='weekday'></Text>
            </View>
          </View>
        </View>

        <View className='guest-row' onClick={() => setShowGuestPopup(true)}>
          <Text>{roomCount}间房 {guestCount}成人</Text>
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
        {hotels.length > 0 ? (
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
                    <View className='score-badge'>{hotel.starRating || 4.5}</View>
                    <Text className='score-text'>很好</Text>
                    <Text className='reviews'>195 reviews</Text>
                </View>

                <View className='location-info'>
                    {hotel.address}
                </View>

                <View className='tags-info'>
                    {hotel.facilities?.slice(0, 3).map((tag: string, idx: number) => (
                         <View key={idx} className='feature-tag'>{tag}</View>
                    ))}
                    {!hotel.facilities?.length && <View className='feature-tag'>暂无标签</View>}
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
          !loading && <Empty description="未找到酒店" />
        )}
        {loading && <View className='loading'>加载中...</View>}
      </View>

      <Calendar
        show={showCalendar}
        type="range"
        onClose={() => setShowCalendar(false)}
        onConfirm={onConfirmDate}
        color="#1989fa"
      />

      <Popup
        show={showGuestPopup}
        position="bottom"
        onClose={() => setShowGuestPopup(false)}
        round
      >
        <View style={{ padding: '20px' }}>
             <View style={{ marginBottom: 20, fontSize: 16, fontWeight: 'bold' }}>选择房间和人数</View>
             <CellGroup>
                 <Cell title="房间数">
                     <Stepper value={roomCount} min={1} max={5} onChange={(e) => setRoomCount(e.detail)} />
                 </Cell>
                 <Cell title="成人数">
                     <Stepper value={guestCount} min={1} max={10} onChange={(e) => setGuestCount(e.detail)} />
                 </Cell>
             </CellGroup>
             <Button type="info" block onClick={() => setShowGuestPopup(false)} style={{ marginTop: 20 }}>确认</Button>
         </View>
       </Popup>

       <Popup
        show={showCityPopup}
        position="bottom"
        onClose={() => setShowCityPopup(false)}
        round
       >
         <View style={{ padding: '20px' }}>
            <View style={{ marginBottom: 20, fontSize: 16, fontWeight: 'bold' }}>选择城市</View>
            <View style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {cityList.map(c => (
                    <Button key={c} size="small" type={city === c ? 'primary' : 'default'} onClick={() => onSelectCity(c)}>
                        {c}
                    </Button>
                ))}
            </View>
         </View>
       </Popup>
     </View>
   );
 };

export default Index;
