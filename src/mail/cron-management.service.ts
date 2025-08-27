import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { CRON_SCHEDULES } from './cron.config';

@Injectable()
export class CronManagementService {
    private readonly logger = new Logger(CronManagementService.name);

    constructor(private schedulerRegistry: SchedulerRegistry) {}

    // Lấy trạng thái của tất cả cronjobs
    getCronJobsStatus() {
        const jobs = this.schedulerRegistry.getCronJobs();
        const status = {};

        jobs.forEach((value: CronJob, key: string) => {
            let next;
            try {
                next = value.nextDate().toJSDate();
            } catch (e) {
                next = 'error - no next date';
            }

            status[key] = {
                running: value.running,
                nextRun: next,
                lastRun: value.lastDate() || 'never'
            };
        });

        return {
            jobs: status,
            totalJobs: jobs.size
        };
    }

    // Bật cronjob
    startCronJob(jobName: string) {
        try {
            const job = this.schedulerRegistry.getCronJob(jobName);
            if (!job.running) {
                job.start();
                this.logger.log(`✅ Đã bật cronjob: ${jobName}`);
                return { success: true, message: `Cronjob ${jobName} đã được bật` };
            } else {
                return { success: false, message: `Cronjob ${jobName} đã đang chạy` };
            }
        } catch (error) {
            this.logger.error(`❌ Lỗi khi bật cronjob ${jobName}:`, error);
            return { success: false, message: `Không tìm thấy cronjob ${jobName}` };
        }
    }

    // Tắt cronjob
    stopCronJob(jobName: string) {
        try {
            const job = this.schedulerRegistry.getCronJob(jobName);
            if (job.running) {
                job.stop();
                this.logger.log(`⏹️  Đã tắt cronjob: ${jobName}`);
                return { success: true, message: `Cronjob ${jobName} đã được tắt` };
            } else {
                return { success: false, message: `Cronjob ${jobName} đã được tắt từ trước` };
            }
        } catch (error) {
            this.logger.error(`❌ Lỗi khi tắt cronjob ${jobName}:`, error);
            return { success: false, message: `Không tìm thấy cronjob ${jobName}` };
        }
    }

    // Chạy cronjob ngay lập tức
    runCronJobNow(jobName: string) {
        try {
            const job = this.schedulerRegistry.getCronJob(jobName);
            job.fireOnTick();
            this.logger.log(`🚀 Đã chạy cronjob ngay: ${jobName}`);
            return { success: true, message: `Đã chạy cronjob ${jobName} ngay lập tức` };
        } catch (error) {
            this.logger.error(`❌ Lỗi khi chạy cronjob ${jobName}:`, error);
            return { success: false, message: `Không thể chạy cronjob ${jobName}` };
        }
    }

    // Xóa và tạo lại cronjob với lịch trình mới
    updateCronSchedule(jobName: string, newSchedule: string) {
        try {
            const existingJob = this.schedulerRegistry.getCronJob(jobName);
            const wasRunning = existingJob.running;
            
            // Xóa cronjob cũ
            this.schedulerRegistry.deleteCronJob(jobName);
            
            // Tạo cronjob mới với lịch trình mới
            const newJob = new CronJob(newSchedule, () => {
                this.logger.log(`🕐 Chạy cronjob với lịch trình mới: ${jobName}`);
                // Gọi function tương ứng
                existingJob.fireOnTick();
            }, null, wasRunning, CRON_SCHEDULES.TIMEZONE);
            
            this.schedulerRegistry.addCronJob(jobName, newJob);
            
            this.logger.log(`🔄 Đã cập nhật lịch trình cho cronjob ${jobName}: ${newSchedule}`);
            return { 
                success: true, 
                message: `Đã cập nhật lịch trình cho cronjob ${jobName}`,
                newSchedule: newSchedule
            };
        } catch (error) {
            this.logger.error(`❌ Lỗi khi cập nhật cronjob ${jobName}:`, error);
            return { success: false, message: `Không thể cập nhật cronjob ${jobName}` };
        }
    }
}
