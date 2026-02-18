import React, { useEffect, useState } from 'react';
import { View, Image, Text, Swiper, SwiperItem } from '@tarojs/components';
import { Button, Cell, CellGroup, Tag, Popup, Icon } from '@antmjs/vantui';
import Taro, { useRouter } from '@tarojs/taro';
import client from '../../api/client';
import './index.scss';

const Detail: React.FC = () => {
  const router = useRouter();
  const { id } = router.params;
  const [hotel, setHotel] = useState<any>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  // Mock dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formatDate = (date: Date) => `${date.getMonth() + 1}月${date.getDate()}日`;

  useEffect(() => {
    if (id) {
      fetchHotelDetail(id);
    }
  }, [id]);

  const fetchHotelDetail = async (hotelId: string) => {
    try {
      const res: any = await client.get(`/hotels/${hotelId}`);
      setHotel(res);
    } catch (err) {
      console.error(err);
    }
  };

  const onBook = (room: any) => {
    const token = Taro.getStorageSync('token');
    if (!token) {
      Taro.navigateTo({ url: '/pages/login/index' });
      return;
    }
    setSelectedRoom(room);
    setShowBooking(true);
  };

  const confirmBooking = () => {
    Taro.showLoading({ title: 'Booking...' });
    setTimeout(() => {
      Taro.hideLoading();
      setShowBooking(false);
      Taro.showToast({ title: 'Booking Success!', icon: 'success' });
    }, 1500);
  };

  if (!hotel) return <View>Loading...</View>;

  const images = hotel.images && hotel.images.length > 0 
    ? hotel.images 
    : ['https://img.yzcdn.cn/vant/ipad.jpeg', 'https://img.yzcdn.cn/vant/ipad.jpeg'];

  return (
    <View className='detail'>
      <Swiper
        className='banner-swiper'
        indicatorColor='#999'
        indicatorActiveColor='#333'
        circular
        indicatorDots
        autoplay
      >
        {images.map((img: string, idx: number) => (
            <SwiperItem key={idx}>
                <Image src={img} className='slide-image' mode='aspectFill' />
            </SwiperItem>
        ))}
      </Swiper>
      
      <View className='info-card'>
        <View className='header-row'>
            <Text className='name'>{hotel.name}</Text>
        </View>

        <View className='tags-row'>
            <Tag color="#f2f3f5" textColor="#666">2024年开业</Tag>
            <Tag color="#fff8e1" textColor="#faad14">镇江影音酒店热卖 No.9</Tag>
        </View>

        <View className='score-row'>
            <View className='score-box'>4.6</View>
            <Text className='score-desc'>很好</Text>
            <Text className='reviews'>195条评论 &gt;</Text>
        </View>
        
        <View className='location-row'>
            <Text className='address-text'>{hotel.address}</Text>
            <View className='map-btn'>
                <Icon name="location-o" size="16px" />
                <Text>地图</Text>
            </View>
        </View>

        <View className='facilities-row'>
            <View className='facility-item'>
                <View className='icon-circle'><Icon name="logistics" /></View>
                <Text>免费停车</Text>
            </View>
            <View className='facility-item'>
                <View className='icon-circle'><Icon name="shop-o" /></View>
                <Text>洗衣房</Text>
            </View>
            <View className='facility-item'>
                <View className='icon-circle'><Icon name="desktop-o" /></View>
                <Text>智能客控</Text>
            </View>
            <View className='facility-item'>
                <View className='icon-circle'><Icon name="bag-o" /></View>
                <Text>行李寄存</Text>
            </View>
        </View>
      </View>

      <View className='date-bar'>
        <View className='dates'>
            <Text className='date'>{formatDate(today)}</Text>
            <Text className='weekday'>今天</Text>
            <Text style={{color: '#ccc'}}>-</Text>
            <Text className='date' style={{marginLeft: 8}}>{formatDate(tomorrow)}</Text>
            <Text className='weekday'>明天</Text>
            <View className='duration'>共1晚</View>
        </View>
        <View style={{display: 'flex', alignItems: 'center'}}>
            <Text style={{fontSize: 12, color: '#333'}}>1间 1人 0儿童</Text>
            <Icon name="arrow-down" size="10px" style={{marginLeft: 2}} />
        </View>
      </View>

      <View className='room-list'>
        {hotel.rooms && hotel.rooms.length > 0 ? (
          hotel.rooms.map((room: any) => (
            <View key={room.id} className='room-card'>
              <Image 
                src={hotel.images?.[0] || 'https://img.yzcdn.cn/vant/ipad.jpeg'} 
                className='room-img'
                mode="aspectFill"
              />
              <View className='room-content'>
                <View>
                    <View className='room-name'>{room.name || '标准间'}</View>
                    <View className='room-desc'>25m² | 有窗 | 双床</View>
                    <View className='room-tags'>
                        <View className='tag'>立即确认</View>
                        <View className='tag'>无需预付</View>
                    </View>
                </View>
                <View className='bottom-row'>
                    <View className='price-box'>
                        <Text className='symbol'>¥</Text>
                        <Text className='val'>{room.price}</Text>
                        <Text className='suffix'>起</Text>
                    </View>
                    <Button size="small" type="info" onClick={() => onBook(room)}>预订</Button>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className='empty'>No rooms available</View>
        )}
      </View>

      <Popup
        show={showBooking}
        position="bottom"
        onClose={() => setShowBooking(false)}
        round
      >
        <View className='booking-popup'>
            <View className='popup-title'>确认预订</View>
            <CellGroup>
                <Cell title="酒店" value={hotel.name} />
                <Cell title="房型" value={selectedRoom?.name} />
                <Cell title="价格" value={`¥${selectedRoom?.price}`} />
            </CellGroup>
            <Button type="primary" block onClick={confirmBooking} style={{marginTop: 20}}>
                确认支付
            </Button>
        </View>
      </Popup>
    </View>
  );
};

export default Detail;
