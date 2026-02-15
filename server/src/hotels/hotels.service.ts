import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
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
    const hotel = this.hotelsRepository.create({
      ...createHotelDto,
      merchant,
      status: HotelStatus.PENDING,
    } as Hotel);
    return this.hotelsRepository.save(hotel);
  }

  async findAllPublic(query: any): Promise<Hotel[]> {
    const where: any = { status: HotelStatus.PUBLISHED };
    if (query.keyword) {
        where.name = Like(`%${query.keyword}%`);
    }
    if (query.city) {
        where.address = Like(`%${query.city}%`);
    }
    return this.hotelsRepository.find({
        where,
        relations: ['rooms'],
        order: { starRating: 'DESC' }
    });
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
      // If rooms are updated, handle separately or via cascade
      Object.assign(hotel, updateHotelDto);
      // Reset status to pending on major updates? Optional.
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
          relations: ['rooms']
      });
  }

  async findAllAdmin(): Promise<Hotel[]> {
      return this.hotelsRepository.find({
          relations: ['merchant'],
          order: { createdAt: 'DESC' }
      });
  }
}
