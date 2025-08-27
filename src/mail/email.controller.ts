import { MailerService } from '@nestjs-modules/mailer';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Public, ResponseMessage } from 'src/auth/decorator/customize';
import { JobsService } from 'src/jobs/jobs.service';
import { CronManagementService } from './cron-management.service';
import { EmailService } from './email.service';
import { Subscriber, SubscriberDocument } from './schemas/subscriber.schema';

@Controller('email')
export class EmailController {
  constructor(
    private readonly mailerService: MailerService,
    private readonly jobsService: JobsService,
    private readonly emailService: EmailService,
    private readonly cronManagementService: CronManagementService,
    @InjectModel(Subscriber.name) private subscriberModel: Model<SubscriberDocument>
  ) {}

  @Get()
  @Public()
  @ResponseMessage('Send email successfully')
  async handleTestEmail(){
    const subscribers = await this.subscriberModel.find({});
    
    if (subscribers.length === 0) {
      return {
        message: "Không có subscribers nào trong database",
        subscribersCount: 0
      };
    }

    let totalEmailsSent = 0;

    for (const subs of subscribers) {
      const subsSkills = subs.skills;
      
      const jobsData = await this.jobsService.findAll(1, 100, '');
      const jobWithMatchingSkills = jobsData.result.filter(job => 
        job.skills && job.skills.some(skill => subsSkills.includes(skill))
      );

      if (jobWithMatchingSkills.length > 0) {
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

        await this.mailerService.sendMail({
          to: subs.email,
          from: "Job Portal <ducytcg123456@gmail.com>",
          subject: `🎯 Jobs phù hợp với skills của bạn (${formattedJobs.length} vị trí)`,
          template: "new-job",
          context: {
            jobs: formattedJobs,
            currentDate: new Date().toLocaleDateString('vi-VN'),
            subscriberName: subs.name
          }
        });

        totalEmailsSent++;
      }
    }

    return {
      message: `Đã gửi email cho ${totalEmailsSent}/${subscribers.length} subscribers có jobs phù hợp`,
      subscribersCount: subscribers.length,
      emailsSent: totalEmailsSent
    };
  }

  @Get('cron-test')
  @Public()
  @ResponseMessage('Test cronjob gửi email thành công')
  async testCronJob() {
    return await this.emailService.sendJobNotificationManually();
  }

  @Get('cron-status')
  @Public()
  @ResponseMessage('Lấy trạng thái cronjobs thành công')
  getCronJobsStatus() {
    return this.cronManagementService.getCronJobsStatus();
  }

  @Post('cron-start/:jobName')
  @Public()
  @ResponseMessage('Bật cronjob thành công')
  startCronJob(@Param('jobName') jobName: string) {
    return this.cronManagementService.startCronJob(jobName);
  }

  @Post('cron-stop/:jobName')
  @Public()
  @ResponseMessage('Tắt cronjob thành công')
  stopCronJob(@Param('jobName') jobName: string) {
    return this.cronManagementService.stopCronJob(jobName);
  }

  @Post('cron-run/:jobName')
  @Public()
  @ResponseMessage('Chạy cronjob ngay thành công')
  runCronJobNow(@Param('jobName') jobName: string) {
    return this.cronManagementService.runCronJobNow(jobName);
  }

  @Post('cron-schedule/:jobName')
  @Public()
  @ResponseMessage('Cập nhật lịch trình cronjob thành công')
  updateCronSchedule(@Param('jobName') jobName: string, @Body() body: { schedule: string }) {
    return this.cronManagementService.updateCronSchedule(jobName, body.schedule);
  }
}
