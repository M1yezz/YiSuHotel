import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query } from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Request() req: any, @Body() createHotelDto: any) {
    // TODO: Check if role is merchant
    return this.hotelsService.create(createHotelDto, req.user);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.hotelsService.findAllPublic(query);
  }

  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  findMyHotels(@Request() req: any) {
      console.log('Accessing /hotels/my', req.user);
      return this.hotelsService.findByMerchant(req.user.userId);
  }
  
  @Get('admin')
  @UseGuards(AuthGuard('jwt')) 
  findAllAdmin() {
      // TODO: Check role admin
      return this.hotelsService.findAllAdmin();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hotelsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Request() req: any, @Param('id') id: string, @Body() updateHotelDto: any) {
    return this.hotelsService.update(+id, updateHotelDto, req.user.userId);
  }
  
  @Patch(':id/audit')
  @UseGuards(AuthGuard('jwt'))
  audit(@Param('id') id: string, @Body() body: { status: any, reason?: string }) {
      return this.hotelsService.audit(+id, body.status, body.reason);
  }
}
