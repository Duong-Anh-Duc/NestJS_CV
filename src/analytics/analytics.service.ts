import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { Analytics } from './analytics.entity';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { GetAnalyticsDto } from './dto/get-analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Analytics)
    private analyticsRepository: Repository<Analytics>,
  ) {}

  async create(createAnalyticsDto: CreateAnalyticsDto): Promise<Analytics> {
    const analytics = this.analyticsRepository.create(createAnalyticsDto);
    return await this.analyticsRepository.save(analytics);
  }

  async findAll(query: GetAnalyticsDto) {
    const { 
      event_type, 
      user_id, 
      resource_id, 
      start_date, 
      end_date, 
      current = 1, 
      pageSize = 10 
    } = query;

    const where: FindOptionsWhere<Analytics> = {};
    
    if (event_type) where.event_type = event_type;
    if (user_id) where.user_id = user_id;
    if (resource_id) where.resource_id = resource_id;
    
    if (start_date && end_date) {
      where.created_at = Between(new Date(start_date), new Date(end_date));
    }

    const [result, total] = await this.analyticsRepository.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (current - 1) * pageSize,
      take: pageSize,
    });

    return {
      meta: {
        current,
        pageSize,
        pages: Math.ceil(total / pageSize),
        total,
      },
      result,
    };
  }

  async findOne(id: number): Promise<Analytics> {
    return await this.analyticsRepository.findOne({ where: { id } });
  }

  async getStatsByEventType(): Promise<any> {
    const stats = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('analytics.event_type', 'event_type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('analytics.event_type')
      .orderBy('count', 'DESC')
      .getRawMany();

    return stats;
  }

  async getDailyStats(days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('DATE(analytics.created_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('analytics.created_at >= :startDate', { startDate })
      .groupBy('DATE(analytics.created_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return stats;
  }

  async getTopUsers(limit: number = 10): Promise<any> {
    const users = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('analytics.user_id', 'user_id')
      .addSelect('COUNT(*)', 'count')
      .where('analytics.user_id IS NOT NULL')
      .groupBy('analytics.user_id')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    return users;
  }

  async trackEvent(eventData: CreateAnalyticsDto): Promise<Analytics> {
    return this.create(eventData);
  }

  async remove(id: number): Promise<void> {
    await this.analyticsRepository.delete(id);
  }
}
