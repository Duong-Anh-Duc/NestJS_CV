import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Public, ResponseMessage } from '../auth/decorator/customize';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { GetAnalyticsDto } from './dto/get-analytics.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post()
  @Public()
  @ResponseMessage('Track analytics event')
  async create(@Body() createAnalyticsDto: CreateAnalyticsDto) {
    return await this.analyticsService.create(createAnalyticsDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Fetch analytics data')
  async findAll(@Query() query: GetAnalyticsDto) {
    return await this.analyticsService.findAll(query);
  }

  @Get('stats/events')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Get analytics stats by event type')
  async getEventStats() {
    return await this.analyticsService.getStatsByEventType();
  }

  @Get('stats/daily')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Get daily analytics stats')
  async getDailyStats(@Query('days') days?: string) {
    const daysCount = days ? parseInt(days, 10) : 30;
    return await this.analyticsService.getDailyStats(daysCount);
  }

  @Get('stats/users')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Get top users')
  async getTopUsers(@Query('limit') limit?: string) {
    const limitCount = limit ? parseInt(limit, 10) : 10;
    return await this.analyticsService.getTopUsers(limitCount);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Get dashboard analytics data')
  async getDashboardData() {
    const [eventStats, dailyStats, topUsers] = await Promise.all([
      this.analyticsService.getStatsByEventType(),
      this.analyticsService.getDailyStats(7), // Last 7 days
      this.analyticsService.getTopUsers(5)
    ]);

    return {
      eventStats,
      dailyStats,
      topUsers
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Get analytics by id')
  async findOne(@Param('id') id: string) {
    return await this.analyticsService.findOne(+id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Delete analytics record')
  async remove(@Param('id') id: string) {
    return await this.analyticsService.remove(+id);
  }

  @Post('track')
  @Public()
  @ResponseMessage('Track event')
  async trackEvent(@Body() eventData: CreateAnalyticsDto) {
    return await this.analyticsService.trackEvent(eventData);
  }
}
