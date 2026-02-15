import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelsService } from './hotels.service';
import { HotelsController } from './hotels.controller';
import { Hotel } from './hotel.entity';
import { Room } from './room.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Hotel, Room]), UsersModule],
  providers: [HotelsService],
  controllers: [HotelsController],
})
export class HotelsModule {}
