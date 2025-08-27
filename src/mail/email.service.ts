import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { JobsService } from 'src/jobs/jobs.service';
import { CRON_SCHEDULES } from './cron.config';
import { Subscriber, SubscriberDocument } from './schemas/subscriber.schema';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor(
        private readonly mailerService: MailerService,
        private readonly jobsService: JobsService,
        @InjectModel(Subscriber.name) private subscriberModel: Model<SubscriberDocument>
    ) {}

    // Cronjob chạy mỗi ngày lúc 8:00 sáng
    @Cron(CRON_SCHEDULES.DAILY_JOB_NOTIFICATION, {
        name: 'daily-job-notification',
        timeZone: CRON_SCHEDULES.TIMEZONE,
    })
    async handleDailyJobNotification() {
        this.logger.log('🕐 Bắt đầu gửi email thông báo job hàng ngày...');
        
        try {
            // Lấy tất cả subscribers
            const subscribers = await this.subscriberModel.find({});
            
            if (subscribers.length === 0) {
                this.logger.warn('⚠️  Không có subscribers nào trong database');
                return;
            }

            let totalEmailsSent = 0;

            // Lặp qua từng subscriber
            for (const subs of subscribers) {
                const subsSkills = subs.skills;
                
                // Tìm jobs có skills trùng khớp với subscriber
                const jobsData = await this.jobsService.findAll(1, 100, '');
                const jobWithMatchingSkills = jobsData.result.filter(job => 
                    job.skills && job.skills.some(skill => subsSkills.includes(skill))
                );

                if (jobWithMatchingSkills.length > 0) {
                    // Format jobs để gửi email
                    const formattedJobs = jobWithMatchingSkills.map(job => ({
                        name: job.name,
                        company: { 
                            name: job.company?.name || 'Không có thông tin công ty'
                        },
                        salary: job.salary ? `${job.salary.toLocaleString('vi-VN')} VND` : 'Thỏa thuận',
                        location: job.location,
                        quantity: job.quantity,
                        level: job.level,
                        skills: job.skills || [],
                        endDate: job.endDate ? new Date(job.endDate).toLocaleDateString('vi-VN') : 'Không xác định'
                    }));

                    // Gửi email cho subscriber này
                    await this.mailerService.sendMail({
                        to: subs.email,
                        from: "Job Portal <ducytcg123456@gmail.com>",
                        subject: `🎯 Jobs phù hợp với skills của bạn (${formattedJobs.length} vị trí) - ${new Date().toLocaleDateString('vi-VN')}`,
                        template: "new-job",
                        context: {
                            jobs: formattedJobs,
                            currentDate: new Date().toLocaleDateString('vi-VN'),
                            subscriberName: subs.name
                        }
                    });

                    totalEmailsSent++;
                    this.logger.log(`✅ Đã gửi email cho ${subs.email} (${formattedJobs.length} jobs phù hợp)`);
                } else {
                    this.logger.log(`ℹ️  Không có job phù hợp với skills của ${subs.email}`);
                }
            }

            this.logger.log(`🎉 Hoàn thành gửi email: ${totalEmailsSent}/${subscribers.length} subscribers nhận được email`);
            
        } catch (error) {
            this.logger.error('❌ Lỗi khi gửi email tự động:', error);
        }
    }

    // Cronjob gửi email vào thứ 2 hàng tuần lúc 9:00 sáng
    @Cron(CRON_SCHEDULES.WEEKLY_JOB_SUMMARY, {
        name: 'weekly-job-summary',
        timeZone: CRON_SCHEDULES.TIMEZONE,
    })
    async handleWeeklyJobSummary() {
        this.logger.log('📅 Bắt đầu gửi tổng kết job hàng tuần...');
        
        try {
            const subscribers = await this.subscriberModel.find({});
            
            if (subscribers.length === 0) {
                this.logger.warn('⚠️  Không có subscribers nào để gửi tổng kết tuần');
                return;
            }

            // Lấy tất cả jobs để gửi tổng kết
            const jobsData = await this.jobsService.findAll(1, 50, '');
            const allJobs = jobsData.result;

            if (allJobs.length === 0) {
                this.logger.warn('⚠️  Không có jobs nào để gửi tổng kết');
                return;
            }

            const formattedJobs = allJobs.map(job => ({
                name: job.name,
                company: { 
                    name: job.company?.name || 'Không có thông tin công ty'
                },
                salary: job.salary ? `${job.salary.toLocaleString('vi-VN')} VND` : 'Thỏa thuận',
                location: job.location,
                quantity: job.quantity,
                level: job.level,
                skills: job.skills || [],
                endDate: job.endDate ? new Date(job.endDate).toLocaleDateString('vi-VN') : 'Không xác định'
            }));

            let weeklyEmailsSent = 0;

            for (const subs of subscribers) {
                await this.mailerService.sendMail({
                    to: subs.email,
                    from: "Job Portal <ducytcg123456@gmail.com>",
                    subject: `📊 Tổng kết việc làm tuần này (${allJobs.length} vị trí)`,
                    template: "job",
                    context: {
                        jobs: formattedJobs,
                        currentDate: new Date().toLocaleDateString('vi-VN'),
                        subscriberName: subs.name
                    }
                });

                weeklyEmailsSent++;
                this.logger.log(`✅ Đã gửi tổng kết tuần cho ${subs.email}`);
            }

            this.logger.log(`🎉 Hoàn thành gửi tổng kết tuần: ${weeklyEmailsSent} emails`);
            
        } catch (error) {
            this.logger.error('❌ Lỗi khi gửi tổng kết tuần:', error);
        }
    }

    // Method để gửi email thủ công (giữ nguyên chức năng cũ)
    async sendJobNotificationManually() {
        this.logger.log('🔧 Gửi email thủ công...');
        
        try {
            // Lấy tất cả subscribers
            const subscribers = await this.subscriberModel.find({});
            
            if (subscribers.length === 0) {
                return {
                    message: "Không có subscribers nào trong database",
                    subscribersCount: 0,
                    emailsSent: 0
                };
            }

            let totalEmailsSent = 0;

            // Lặp qua từng subscriber
            for (const subs of subscribers) {
                const subsSkills = subs.skills;
                
                // Tìm jobs có skills trùng khớp với subscriber
                const jobsData = await this.jobsService.findAll(1, 100, '');
                const jobWithMatchingSkills = jobsData.result.filter(job => 
                    job.skills && job.skills.some(skill => subsSkills.includes(skill))
                );

                if (jobWithMatchingSkills.length > 0) {
                    // Format jobs để gửi email
                    const formattedJobs = jobWithMatchingSkills.map(job => ({
                        name: job.name,
                        company: { 
                            name: job.company?.name || 'Không có thông tin công ty'
                        },
                        salary: job.salary ? `${job.salary.toLocaleString('vi-VN')} VND` : 'Thỏa thuận',
                        location: job.location,
                        quantity: job.quantity,
                        level: job.level,
                        skills: job.skills || [],
                        endDate: job.endDate ? new Date(job.endDate).toLocaleDateString('vi-VN') : 'Không xác định'
                    }));

                    // Gửi email cho subscriber này
                    await this.mailerService.sendMail({
                        to: subs.email,
                        from: "Job Portal <ducytcg123456@gmail.com>",
                        subject: `🎯 Jobs phù hợp với skills của bạn (${formattedJobs.length} vị trí) - Thủ công`,
                        template: "new-job",
                        context: {
                            jobs: formattedJobs,
                            currentDate: new Date().toLocaleDateString('vi-VN'),
                            subscriberName: subs.name
                        }
                    });

                    totalEmailsSent++;
                    this.logger.log(`✅ Đã gửi email cho ${subs.email} (${formattedJobs.length} jobs phù hợp)`);
                }
            }

            const result = {
                message: `Đã gửi email cho ${totalEmailsSent}/${subscribers.length} subscribers có jobs phù hợp`,
                subscribersCount: subscribers.length,
                emailsSent: totalEmailsSent
            };

            this.logger.log(`🎉 Hoàn thành gửi email thủ công: ${totalEmailsSent}/${subscribers.length} subscribers`);
            return result;
            
        } catch (error) {
            this.logger.error('❌ Lỗi khi gửi email thủ công:', error);
            throw error;
        }
    }
}
