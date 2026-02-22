import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Banner } from './banner.entity';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private bannersRepository: Repository<Banner>,
  ) {}

  async findAll(): Promise<Banner[]> {
      const today = new Date().toISOString().split('T')[0];
      
      return this.bannersRepository.createQueryBuilder('banner')
          .where('banner.isActive = :isActive', { isActive: true })
          .andWhere('banner.status = :status', { status: 'approved' })
          .andWhere('(banner.startDate IS NULL OR banner.startDate <= :today)', { today })
          .andWhere('(banner.endDate IS NULL OR banner.endDate >= :today)', { today })
          .orderBy('banner.order', 'DESC')
          .addOrderBy('banner.createdAt', 'DESC')
          .getMany();
  }

  async findAllAdmin(): Promise<Banner[]> {
      return this.bannersRepository.find({
          order: { createdAt: 'DESC' }
      });
  }

  async audit(id: number, status: 'approved' | 'rejected', reason?: string): Promise<Banner> {
      const banner = await this.bannersRepository.findOne({ where: { id } });
      if (!banner) throw new Error('Banner not found');
      banner.status = status;
      if (status === 'approved') {
          banner.isActive = true;
          banner.auditReason = '';
      } else if (status === 'rejected') {
          banner.isActive = false;
          if (reason) banner.auditReason = reason;
      }
      return this.bannersRepository.save(banner);
  }

  async create(data: any): Promise<Banner> {
    const banner = this.bannersRepository.create({
        ...data,
        isActive: false, // Default to false until approved
        status: 'pending'
    });
    return (await this.bannersRepository.save(banner)) as unknown as Banner;
  }

  async findByHotel(hotelId: number): Promise<Banner[]> {
      return this.bannersRepository.find({
          where: { hotelId },
          order: { createdAt: 'DESC' }
      });
  }
}
