import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Analytics } from './analytics.entity';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post()
  async create(@Body() analyticsData: Partial<Analytics>) {
    return await this.analyticsService.create(analyticsData);
  }

  @Get()
  async findAll() {
    return await this.analyticsService.findAll();
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    return await this.analyticsService.findByUserId(userId);
  }

  @Get('stats')
  async getStats() {
    return await this.analyticsService.getEventStats();
  }
}
