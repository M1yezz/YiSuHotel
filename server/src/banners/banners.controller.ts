import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { BannersService } from './banners.service';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get('public')
  findAll() {
    return this.bannersService.findAll();
  }

  @Get('admin')
  findAllAdmin() {
      return this.bannersService.findAllAdmin();
  }

  @Patch(':id/audit')
  audit(@Param('id') id: string, @Body('status') status: 'approved' | 'rejected', @Body('reason') reason?: string) {
      return this.bannersService.audit(+id, status, reason);
  }

  @Get('hotel/:hotelId')
  findByHotel(@Param('hotelId') hotelId: string) {
      return this.bannersService.findByHotel(+hotelId);
  }

  @Post()
  create(@Body() createBannerDto: any) {
    return this.bannersService.create(createBannerDto);
  }
}
