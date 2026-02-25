import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Hotel, HotelStatus } from './hotel.entity';
import { Room } from './room.entity';
import { User } from '../users/user.entity';

@Injectable()
export class HotelsService {
  constructor(
    @InjectRepository(Hotel)
    private hotelsRepository: Repository<Hotel>,
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
  ) {}

  async create(createHotelDto: any, merchant: User): Promise<Hotel> {
    const merchantObj = merchant as any;
    const hotel = this.hotelsRepository.create({
      ...createHotelDto,
      merchant: { id: merchant.id || merchantObj.userId } as User, // 显式构造包含 id 的 User 对象
      status: HotelStatus.PENDING,
    } as Hotel);
    return this.hotelsRepository.save(hotel);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  async findAllPublic(query: any): Promise<Hotel[]> {
    const qb = this.hotelsRepository.createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.rooms', 'room')
      .where('hotel.status = :status', { status: HotelStatus.PUBLISHED });

    if (query.keyword) {
      qb.andWhere('(hotel.name LIKE :keyword OR hotel.address LIKE :keyword)', { keyword: `%${query.keyword}%` });
    }

    if (query.city) {
      qb.andWhere('hotel.address LIKE :city', { city: `%${query.city}%` });
    }

    if (query.type) {
      qb.andWhere('hotel.type = :type', { type: query.type });
    }
    
    if (query.starRating) {
      if (query.minStar && query.maxStar) {
        qb.andWhere('hotel.starRating BETWEEN :minStar AND :maxStar', { minStar: query.minStar, maxStar: query.maxStar });
      } else if (query.minStar) {
        qb.andWhere('hotel.starRating >= :minStar', { minStar: query.minStar });
      } else if (query.maxStar) {
        qb.andWhere('hotel.starRating <= :maxStar', { maxStar: query.maxStar });
      }
    }

    qb.orderBy('hotel.starRating', 'DESC');

    let hotels: any[] = await qb.getMany();

    if (query.minPrice || query.maxPrice) {
        const minPrice = query.minPrice ? parseFloat(query.minPrice) : 0;
        const maxPrice = query.maxPrice ? parseFloat(query.maxPrice) : Infinity;

        hotels = hotels.filter(hotel => {
            if (!hotel.rooms || hotel.rooms.length === 0) return false;
            const lowestPrice = Math.min(...hotel.rooms.map((r: any) => Number(r.price)));
            return lowestPrice >= minPrice && lowestPrice <= maxPrice;
        });
    }

    if (query.userLat && query.userLng) {
        const userLat = parseFloat(query.userLat);
        const userLng = parseFloat(query.userLng);
        
        hotels = hotels.map(hotel => {
            if (hotel.latitude && hotel.longitude) {
                const distance = this.calculateDistance(userLat, userLng, hotel.latitude, hotel.longitude);
                return { ...hotel, distance: Math.round(distance) }; // Add distance property (meters)
            }
            return { ...hotel, distance: null };
        });

        hotels.sort((a, b) => {
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
        });
    }

    return hotels;
  }

  async findOne(id: number): Promise<Hotel> {
    const hotel = await this.hotelsRepository.findOne({
        where: { id },
        relations: ['rooms', 'merchant']
    });
    if (!hotel) throw new NotFoundException(`Hotel #${id} not found`);
    return hotel;
  }

  async update(id: number, updateHotelDto: any, merchantId: number): Promise<Hotel> {
      const hotel = await this.findOne(id);
      if (hotel.merchant.id !== merchantId) {
          throw new ForbiddenException('Not authorized');
      }
      Object.assign(hotel, updateHotelDto);
      return this.hotelsRepository.save(hotel);
  }
  
  async audit(id: number, status: HotelStatus, reason?: string): Promise<Hotel> {
      const hotel = await this.findOne(id);
      hotel.status = status;
      if (reason) hotel.auditReason = reason;
      return this.hotelsRepository.save(hotel);
  }

  async findByMerchant(merchantId: number): Promise<Hotel[]> {
      return this.hotelsRepository.find({
          where: { merchant: { id: merchantId } },
          relations: ['rooms'],
          order: { createdAt: 'DESC' }
      });
  }

  async findAllAdmin(): Promise<Hotel[]> {
      return this.hotelsRepository.find({
          relations: ['merchant'],
          order: { createdAt: 'DESC' }
      });
  }
}
