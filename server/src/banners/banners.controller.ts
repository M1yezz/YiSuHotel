import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { BannersService } from './banners.service';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  findAll() {
    return this.bannersService.findAll();
  }

  @Post()
  create(@Body() createBannerDto: any) {
    return this.bannersService.create(createBannerDto);
  }
}
