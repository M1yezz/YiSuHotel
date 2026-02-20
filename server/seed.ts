import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { Banner } from './src/banners/banner.entity';
import { Hotel, HotelStatus, HotelType } from './src/hotels/hotel.entity';
import { Room } from './src/hotels/room.entity';
import { User, UserRole } from './src/users/user.entity';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const userRepository = dataSource.getRepository(User);
  const hotelRepository = dataSource.getRepository(Hotel);
  const roomRepository = dataSource.getRepository(Room);
  const bannerRepository = dataSource.getRepository(Banner);

  console.log('Seeding data...');

  // 1. Create a dummy merchant user if not exists
  let merchant = await userRepository.findOne({ where: { username: 'test_merchant' } });
  if (!merchant) {
    merchant = userRepository.create({
      username: 'test_merchant',
      passwordHash: 'dummyhash', // In real app, use hashed password
      role: UserRole.MERCHANT,
    });
    await userRepository.save(merchant);
    console.log('Created merchant user: test_merchant');
  }

  // 2. Create Hotels (Domestic, Overseas, Homestay) with Lat/Lng
  const hotelsData = [
    {
      name: '北京君悦大酒店',
      address: '北京市朝阳区建国路1号',
      latitude: 39.9042,
      longitude: 116.4074,
      starRating: 5,
      type: HotelType.DOMESTIC,
      status: HotelStatus.PUBLISHED,
      facilities: ['Wifi', 'Parking', 'Pool', 'Gym', 'Restaurant'],
      storeImg: 'https://img.yzcdn.cn/vant/apple-1.jpg',
      description: '豪华五星级酒店，位于市中心，交通便利。',
    },
    {
      name: '上海和平饭店',
      address: '上海市黄浦区南京东路20号',
      latitude: 31.2304,
      longitude: 121.4737,
      starRating: 5,
      type: HotelType.DOMESTIC,
      status: HotelStatus.PUBLISHED,
      facilities: ['Wifi', 'Restaurant', 'Meeting', 'Spa'],
      storeImg: 'https://img.yzcdn.cn/vant/apple-2.jpg',
      description: '历史悠久的豪华酒店，外滩地标建筑。',
    },
    {
      name: '东京帝国酒店',
      address: '日本东京都千代田区',
      latitude: 35.6895,
      longitude: 139.6917,
      starRating: 5,
      type: HotelType.OVERSEAS,
      status: HotelStatus.PUBLISHED,
      facilities: ['Wifi', 'Gym', 'Spa'],
      storeImg: 'https://img.yzcdn.cn/vant/apple-3.jpg',
      description: '东京顶级酒店，服务一流。',
    },
    {
      name: '曼谷河畔度假村',
      address: '泰国曼谷湄南河畔',
      latitude: 13.7563,
      longitude: 100.5018,
      starRating: 4,
      type: HotelType.OVERSEAS,
      status: HotelStatus.PUBLISHED,
      facilities: ['Wifi', 'Pool', 'Restaurant'],
      storeImg: 'https://img.yzcdn.cn/vant/apple-4.jpg',
      description: '享受曼谷的悠闲时光，河畔美景尽收眼底。',
    },
    {
      name: '莫干山云端民宿',
      address: '浙江省湖州市德清县莫干山镇',
      latitude: 30.6000,
      longitude: 119.9833,
      starRating: 3,
      type: HotelType.HOMESTAY,
      status: HotelStatus.PUBLISHED,
      facilities: ['Wifi', 'Parking'],
      storeImg: 'https://img.yzcdn.cn/vant/apple-5.jpg',
      description: '山间清幽民宿，体验自然之美。',
    }
  ];

  for (const hData of hotelsData) {
    let hotel = await hotelRepository.findOne({ where: { name: hData.name } });
    if (!hotel) {
      hotel = hotelRepository.create({
        ...hData,
        merchant,
      });
      await hotelRepository.save(hotel);
      console.log(`Created hotel: ${hotel.name}`);

      // 3. Create Rooms for each hotel
      const roomsData = [
        { title: '豪华大床房', price: 800, stock: 10, roomImg: 'https://img.yzcdn.cn/vant/apple-1.jpg' },
        { title: '行政双床房', price: 1200, stock: 5, roomImg: 'https://img.yzcdn.cn/vant/apple-2.jpg' },
        { title: '总统套房', price: 5000, stock: 1, roomImg: 'https://img.yzcdn.cn/vant/apple-3.jpg' }
      ];

      for (const rData of roomsData) {
        const room = roomRepository.create({
          ...rData,
          hotel,
        });
        await roomRepository.save(room);
        console.log(`  - Created room: ${room.title}`);
      }
    } else {
        console.log(`Hotel already exists: ${hotel.name}`);
    }
  }

  // 4. Create Banners
  const bannersData = [
      { title: '春节特惠', imageUrl: 'https://img.yzcdn.cn/vant/apple-1.jpg', order: 1, hotelId: 1 },
      { title: '新店开业', imageUrl: 'https://img.yzcdn.cn/vant/apple-2.jpg', order: 2, hotelId: 2 },
      { title: '海外精选', imageUrl: 'https://img.yzcdn.cn/vant/apple-3.jpg', order: 3, hotelId: 3 }
  ];

  for (const bData of bannersData) {
      // Simple check to avoid duplicates based on title for demo
      const existing = await bannerRepository.findOne({ where: { title: bData.title } });
      if (!existing) {
          const banner = bannerRepository.create(bData);
          await bannerRepository.save(banner);
          console.log(`Created banner: ${banner.title}`);
      }
  }

  console.log('Seeding completed!');
  await app.close();
}

bootstrap();
