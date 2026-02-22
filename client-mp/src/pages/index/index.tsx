import React, { useEffect, useState } from 'react';
import { View, Image, Text, Swiper, SwiperItem } from '@tarojs/components';
import { Search, Button, Tabs, Tab, Icon, Empty, Calendar, Popup, Field, Cell, CellGroup, Stepper } from '@antmjs/vantui';
import Taro, { useDidShow, useReachBottom } from '@tarojs/taro';
import client from '../../api/client';
import './index.scss';

const Index: React.FC = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [keyword, setKeyword] = useState('');
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res: any = await client.get('/banners/public');
      if (res && res.length > 0) {
        setBanners(res);
      }
    } catch (error) {
      console.error('Fetch banners failed:', error);
    }
  };

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

  // Price & Star Filter
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedStar, setSelectedStar] = useState<string>('');
  
  const starOptions = [
      { label: '3星及以下', value: '0,3', min: 0, max: 3 },
      { label: '3-4星', value: '3,4', min: 3, max: 4 },
      { label: '4-5星', value: '4,5', min: 4, max: 5 }
  ];

  // City & Location
  const [city, setCity] = useState('');
  const [showCityPopup, setShowCityPopup] = useState(false);
  
  const domesticCities = ['全部', '北京', '上海', '广州', '深圳', '杭州', '南京', '苏州', '天津', '武汉', '重庆', '成都', '西安', '长沙', '青岛', '昆明', '大连', '厦门', '沈阳', '宁波', '郑州', '无锡', '福州', '哈尔滨', '济南', '佛山', '东莞', '烟台', '合肥', '石家庄', '南宁', '长春', '南昌', '太原', '镇江'];
  const overseasCountries = ['全部', '日本', '泰国', '新加坡', '韩国', '马来西亚', '美国', '英国', '澳大利亚', '加拿大', '法国', '德国', '意大利', '迪拜', '马尔代夫', '巴厘岛', '越南', '印度尼西亚', '俄罗斯', '新西兰'];
  
  const currentCityList = activeTab === 1 ? overseasCountries : domesticCities; // 1 is overseas

  const facilityMap: Record<string, string> = {
      'Wifi': '无线网络',
      'Parking': '停车场',
      'Pool': '游泳池',
      'Gym': '健身房',
      'Restaurant': '餐厅',
      'Meeting': '会议室',
      'Spa': '水疗中心'
  };

  const formatDate = (date: Date) => `${date.getMonth() + 1}月${date.getDate()}日`;
  const getDayDiff = (d1: Date, d2: Date) => {
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

  const fetchHotels = async (isRefresh = false, tabIndex = activeTab, cityOverride?: string, lat?: number, lng?: number) => {
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
      const targetCity = cityOverride !== undefined ? cityOverride : city;
      if (targetCity && targetCity !== '全部') queryParams.city = targetCity;
      
      // Use passed lat/lng or fallback to state if available
      const currentLat = lat !== undefined ? lat : userLocation?.lat;
      const currentLng = lng !== undefined ? lng : userLocation?.lng;

      if (currentLat && currentLng) {
          queryParams.userLat = currentLat;
          queryParams.userLng = currentLng;
      }
      
      // Map tab index to type
      const typeMap = ['domestic', 'overseas', 'homestay'];
      if (typeMap[tabIndex]) {
          queryParams.type = typeMap[tabIndex];
      }
      
      // Price & Star Filter
      if (minPrice) queryParams.minPrice = minPrice;
      if (maxPrice) queryParams.maxPrice = maxPrice;
      
      if (selectedStar) {
          const option = starOptions.find(o => o.value === selectedStar);
          if (option) {
              queryParams.starRating = true; // Flag to enable star filter
              queryParams.minStar = option.min;
              queryParams.maxStar = option.max;
          }
      }

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

  const onConfirmFilter = () => {
      setShowFilterPopup(false);
      setPage(1);
      setHasMore(true);
      setHotels([]);
      setTimeout(() => {
          fetchHotels(true);
      }, 0);
  };

  const onResetFilter = () => {
      setMinPrice('');
      setMaxPrice('');
      setSelectedStar('');
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
    // Pass the new city directly to ensure fetch uses the updated value immediately
    fetchHotels(true, activeTab, c);
  };

  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const getLocation = () => {
    Taro.getLocation({
      type: 'wgs84',
      success: function (res) {
        Taro.showToast({ title: '定位成功', icon: 'success' });
        setUserLocation({ lat: res.latitude, lng: res.longitude });
        
        // Fetch hotels sorted by distance
        // Assuming we want to reset other filters or just sort current results
        // Let's reload hotels with location params
        setPage(1);
        setHasMore(true);
        setHotels([]);
        
        setTimeout(() => {
            fetchHotels(true, activeTab, city, res.latitude, res.longitude);
        }, 0);
      },
      fail: function (err) {
        console.error(err);
        Taro.showToast({ title: '定位失败', icon: 'none' });
      }
    });
  };

  const getScoreDescription = (score: number) => {
      if (score >= 4.8) return '优享';
      if (score >= 4) return '舒适';
      if (score >= 3) return '良好';
      if (score >= 2) return '较差';
      return '很差';
  };

  const getReviewCount = (id: any) => {
      if (!id) return 200;
      // Deterministic random number between 200 and 1000 based on ID
      const numId = parseInt(String(id).replace(/\D/g, '')) || 0;
      return (numId * 137) % 801 + 200;
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
        <Tabs active={activeTab} onChange={(e) => {
            setActiveTab(e.detail.index);
            // Reset pagination and reload hotels when tab changes
            // e.detail.index: 0 -> domestic, 1 -> overseas, 2 -> homestay
            setPage(1);
            setHasMore(true);
            setCity('全部');
            setHotels([]); // Clear current list
            // Explicitly pass '全部' as city to reset filtering for the new tab
            setTimeout(() => {
                fetchHotels(true, e.detail.index, '全部');
            }, 0);
        }}>
          <Tab title='国内' />
          <Tab title='海外' />
          <Tab title='民宿' />
        </Tabs>

        <View className='location-row'>
          <View className='city' onClick={() => setShowCityPopup(true)}>
            {city || '全部'} <Icon name="arrow-down" size="16px" style={{ marginLeft: 4 }} />
          </View>
          <View className='current-location' onClick={getLocation}>
            <Icon name="aim" size="20px" color="#1989fa" style={{ marginRight: 4 }} />
            <Text>附近酒店</Text>
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
          <View onClick={(e) => { e.stopPropagation(); setShowFilterPopup(true); }}>
            <Text className='placeholder'>{
                (minPrice || maxPrice || selectedStar) ? '已筛选' : '价格/星级'
            }</Text>
          </View>
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
                src={hotel.storeImg || hotel.images?.[0] || 'https://img.yzcdn.cn/vant/ipad.jpeg'}
                mode='aspectFill'
              />
              <View className='content'>
                <View className='title-row'>
                    <Text className='name'>{hotel.name}</Text>
                </View>
                
                <View className='score-row'>
                    <View className='score-badge'>{hotel.starRating || 4.5}</View>
                    <Text className='score-text'>{getScoreDescription(Number(hotel.starRating || 4.5))}</Text>
                    <Text className='reviews'>{getReviewCount(hotel.id)} 条点评</Text>
                </View>

                <View className='location-info'>
                    <View className='address-text'>{hotel.address}</View>
                    {hotel.distance !== undefined && hotel.distance !== null && (
                         <View className='distance-text'>
                             距您直线{hotel.distance > 1000 ? (hotel.distance / 1000).toFixed(1) + 'km' : hotel.distance + '米'}
                         </View>
                    )}
                </View>

                <View className='tags-info'>
                    {hotel.facilities?.slice(0, 3).map((tag: string, idx: number) => (
                         <View key={idx} className='feature-tag'>{facilityMap[tag] || tag}</View>
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
             <View style={{ marginBottom: 20, fontSize: 18, fontWeight: 'bold' }}>选择房间和人数</View>
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
         show={showFilterPopup}
         position="bottom"
         onClose={() => setShowFilterPopup(false)}
         round
        >
          <View style={{ padding: '20px' }}>
             <View style={{ marginBottom: 20, fontSize: 18, fontWeight: 'bold' }}>价格与星级</View>
             
             <View style={{ marginBottom: 16 }}>
                 <Text style={{ fontSize: 16, color: '#333', marginBottom: 8, display: 'block' }}>价格区间 (¥)</Text>
                 <View style={{ display: 'flex', alignItems: 'center' }}>
                     <Field
                        value={minPrice}
                        placeholder="最低价"
                        type="number"
                        border={false}
                        onChange={(e) => setMinPrice(e.detail)}
                        style={{ background: '#f7f8fa', padding: '8px 12px', borderRadius: 4, flex: 1, textAlign: 'center', fontSize: '16px' }}
                     />
                     <Text style={{ margin: '0 8px', color: '#999' }}>-</Text>
                     <Field
                        value={maxPrice}
                        placeholder="最高价"
                        type="number"
                        border={false}
                        onChange={(e) => setMaxPrice(e.detail)}
                        style={{ background: '#f7f8fa', padding: '8px 12px', borderRadius: 4, flex: 1, textAlign: 'center', fontSize: '16px' }}
                     />
                 </View>
             </View>

             <View style={{ marginBottom: 24 }}>
                 <Text style={{ fontSize: 16, color: '#333', marginBottom: 8, display: 'block' }}>星级</Text>
                 <View style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                     {starOptions.map(opt => (
                         <Button 
                            key={opt.value} 
                            size="small" 
                            type={selectedStar === opt.value ? 'primary' : 'default'} 
                            onClick={() => setSelectedStar(selectedStar === opt.value ? '' : opt.value)}
                            plain={selectedStar !== opt.value}
                            style={{ fontSize: '14px', height: '32px' }}
                         >
                             {opt.label}
                         </Button>
                     ))}
                 </View>
             </View>

             <View style={{ display: 'flex', gap: 12 }}>
                 <Button block onClick={onResetFilter} style={{ flex: 1 }}>重置</Button>
                 <Button type="info" block onClick={onConfirmFilter} style={{ flex: 1 }}>确认</Button>
             </View>
          </View>
        </Popup>

        <Popup
         show={showCityPopup}
        position="bottom"
        onClose={() => setShowCityPopup(false)}
        round
       >
         <View style={{ padding: '20px' }}>
            <View style={{ marginBottom: 20, fontSize: 18, fontWeight: 'bold' }}>选择城市</View>
            <View style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {currentCityList.map(c => (
                    <Button key={c} size="small" type={city === c ? 'primary' : 'default'} onClick={() => onSelectCity(c)} style={{ fontSize: '14px', height: '32px' }}>
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
