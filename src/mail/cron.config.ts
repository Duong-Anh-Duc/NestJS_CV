export const CRON_SCHEDULES = {
  // Gửi email hàng ngày lúc 8:00 sáng
  DAILY_JOB_NOTIFICATION: '0 11 * * *',
  
  // Gửi email hàng tuần vào thứ 2 lúc 9:00 sáng  
  WEEKLY_JOB_SUMMARY: '0 9 * * 1',
  
  // Timezone
  TIMEZONE: 'Asia/Ho_Chi_Minh'
};

// Giải thích các pattern:
// '0 8 * * *' = Mỗi ngày lúc 8:00 sáng
// '0 9 * * 1' = Thứ 2 hàng tuần lúc 9:00 sáng
// '0 */2 * * *' = Mỗi 2 tiếng
// '0 0 * * 0' = Chủ nhật hàng tuần lúc 0:00
// '0 12 1 * *' = Ngày 1 hàng tháng lúc 12:00
