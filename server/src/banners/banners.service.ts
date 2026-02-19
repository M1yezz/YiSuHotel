import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './banner.entity';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private bannersRepository: Repository<Banner>,
  ) {}

  findAll(): Promise<Banner[]> {
    return this.bannersRepository.find({
      where: { isActive: true },
      order: { order: 'DESC', createdAt: 'DESC' },
    });
  }

  async create(data: any): Promise<Banner> {
    const banner = this.bannersRepository.create(data);
    return (await this.bannersRepository.save(banner)) as unknown as Banner;
  }
}
