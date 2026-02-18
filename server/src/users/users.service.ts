import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ username });
  }

  async create(username: string, passwordHash: string, role: UserRole): Promise<User> {
    const user = this.usersRepository.create({ username, passwordHash, role });
    try {
      return await this.usersRepository.save(user);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Username already exists');
      }
      throw new InternalServerErrorException();
    }
  }
}
