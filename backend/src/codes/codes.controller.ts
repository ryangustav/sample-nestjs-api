import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Headers, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CodesService } from './codes.service';
import { GenerateCodeDto } from './dto/generate-code.dto';

@Controller('codes')
export class CodesController {
  constructor(private codesService: CodesService) {}

  @Post('generate')
  @UseGuards(AuthGuard('jwt'))
  async generate(@Body() dto: GenerateCodeDto, @Request() req) {
    return this.codesService.generate(dto, req.user._id);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll() {
    return this.codesService.findAll();
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: string) {
    return this.codesService.remove(id);
  }

  @Get('verify/:code')
  async verify(
    @Param('code') code: string,
    @Headers('x-device-id') deviceId: string,
    @Query('deviceId') deviceIdQuery: string,
  ) {
    const deviceId = deviceId || deviceIdQuery;
    return this.codesService.verify(code, deviceId);
  }
}
