import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Analytics } from './analytics.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Analytics)
    private analyticsRepository: Repository<Analytics>,
  ) {}

  async create(analyticsData: Partial<Analytics>): Promise<Analytics> {
    const analytics = this.analyticsRepository.create(analyticsData);
    return await this.analyticsRepository.save(analytics);
  }

  async findAll(): Promise<Analytics[]> {
    return await this.analyticsRepository.find();
  }

  async findByUserId(userId: string): Promise<Analytics[]> {
    return await this.analyticsRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' }
    });
  }

  async getEventStats(): Promise<any> {
    return await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('analytics.event_name', 'event_name')
      .addSelect('COUNT(*)', 'count')
      .groupBy('analytics.event_name')
      .getRawMany();
  }
}
