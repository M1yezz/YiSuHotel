import React, { useEffect, useState } from 'react';
import { View, Image, Text, Swiper, SwiperItem } from '@tarojs/components';
import { Button, Cell, CellGroup, Tag, Popup, Icon, Calendar, Stepper } from '@antmjs/vantui';
import Taro, { useRouter } from '@tarojs/taro';
import client from '../../api/client';
import './index.scss';

const Detail: React.FC = () => {
  const router = useRouter();
  const { id, startDate, endDate, guestCount: paramGuestCount, roomCount: paramRoomCount } = router.params;
  const [hotel, setHotel] = useState<any>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  
  // Date Selection
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState<[Date, Date]>([new Date(), new Date(new Date().getTime() + 86400000)]);
  
  // Guest Selection
  const [showGuestPopup, setShowGuestPopup] = useState(false);
  const [guestCount, setGuestCount] = useState(1);
  const [roomCount, setRoomCount] = useState(1);

  useEffect(() => {
    // Parse params
    if (startDate && endDate) {
        setDateRange([new Date(parseInt(startDate as string)), new Date(parseInt(endDate as string))]);
    }
    if (paramGuestCount) setGuestCount(parseInt(paramGuestCount as string));
    if (paramRoomCount) setRoomCount(parseInt(paramRoomCount as string));

    if (id) {
      fetchHotelDetail(id as string);
    }
  }, [id, startDate, endDate, paramGuestCount, paramRoomCount]);

  const formatDate = (date: Date) => `${date.getMonth() + 1}月${date.getDate()}日`;
  const getDayDiff = (d1: Date, d2: Date) => {
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

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

  const confirmBooking = async () => {
    Taro.showLoading({ title: '提交订单中...' });
    try {
        // Mock API call to backend
        // In real app: await client.post('/bookings', { hotelId: hotel.id, roomId: selectedRoom.id, startDate: dateRange[0], endDate: dateRange[1], ... })
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        
        Taro.hideLoading();
        setShowBooking(false);
        Taro.showToast({ title: '预订成功', icon: 'success' });
        // Navigate to Order list or success page
    } catch (error) {
        Taro.hideLoading();
        Taro.showToast({ title: '预订失败', icon: 'none' });
    }
  };
  
  const openMap = () => {
      // Mock coordinates if hotel doesn't have them
      // In real app, hotel.latitude and hotel.longitude should exist
      const latitude = 32.2044; // Zhenjiang generic
      const longitude = 119.4546;
      
      Taro.openLocation({
          latitude,
          longitude,
          name: hotel?.name,
          address: hotel?.address,
          scale: 18
      });
  };
  
  const onConfirmDate = (event: any) => {
    const [start, end] = event.detail;
    setDateRange([start, end]);
    setShowCalendar(false);
  };

  if (!hotel) return <View>Loading...</View>;

  const images = hotel.images && hotel.images.length > 0 
    ? hotel.images 
    : ['https://img.yzcdn.cn/vant/ipad.jpeg', 'https://img.yzcdn.cn/vant/ipad.jpeg'];

  const nightCount = getDayDiff(dateRange[0], dateRange[1]);
  const totalPrice = selectedRoom ? selectedRoom.price * nightCount * roomCount : 0;

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
            <View className='score-box'>{hotel.starRating || 4.5}</View>
            <Text className='score-desc'>很好</Text>
            <Text className='reviews'>195条评论 &gt;</Text>
        </View>
        
        <View className='location-row'>
            <Text className='address-text'>{hotel.address}</Text>
            <View className='map-btn' onClick={openMap}>
                <Icon name="location-o" size="16px" />
                <Text>地图</Text>
            </View>
        </View>

        <View className='facilities-row'>
            {hotel.facilities?.slice(0, 4).map((fac: string, idx: number) => (
                <View key={idx} className='facility-item'>
                    <View className='icon-circle'><Icon name="star-o" /></View>
                    <Text>{fac}</Text>
                </View>
            ))}
            {!hotel.facilities?.length && <Text>暂无设施信息</Text>}
        </View>
      </View>

      <View className='date-bar'>
        <View className='dates' onClick={() => setShowCalendar(true)}>
            <Text className='date'>{formatDate(dateRange[0])}</Text>
            <Text className='weekday'></Text>
            <Text style={{color: '#ccc'}}>-</Text>
            <Text className='date' style={{marginLeft: 8}}>{formatDate(dateRange[1])}</Text>
            <Text className='weekday'></Text>
            <View className='duration'>共{nightCount}晚</View>
        </View>
        <View style={{display: 'flex', alignItems: 'center'}} onClick={() => setShowGuestPopup(true)}>
            <Text style={{fontSize: 14, color: '#333'}}>{roomCount}间 {guestCount}人</Text>
            <Icon name="arrow-down" size="12px" style={{marginLeft: 2}} />
        </View>
      </View>

      <View className='room-list'>
        {hotel.rooms && hotel.rooms.length > 0 ? (
          hotel.rooms.map((room: any) => (
            <View key={room.id} className='room-card'>
              <Image 
                src={room.roomImg || hotel.images?.[0] || 'https://img.yzcdn.cn/vant/ipad.jpeg'} 
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
                        <View className='tag'>可吸烟</View>
                    </View>
                </View>
                <View className='bottom-row'>
                    <View className='price-box'>
                        <Text className='original-price'>¥{Math.floor(room.price * 1.5)}</Text>
                        <View className='current-price-row'>
                            <Text className='symbol'>¥</Text>
                            <Text className='val'>{room.price}</Text>
                            <Text className='suffix'>起</Text>
                        </View>
                    </View>
                    <View className='book-btn' onClick={() => onBook(room)}>
                        预订
                    </View>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className='empty'>房间已满</View>
        )}
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
                <Cell title="日期" value={`${formatDate(dateRange[0])} - ${formatDate(dateRange[1])} (${nightCount}晚)`} />
                <Cell title="房间数" value={roomCount} />
                <Cell title="总价" value={`¥${totalPrice}`} label="在线支付" />
            </CellGroup>
            <Button type="primary" block onClick={confirmBooking} style={{marginTop: 20}}>
                立即支付 ¥{totalPrice}
            </Button>
        </View>
      </Popup>
    </View>
  );
};

export default Detail;
