# 📧 Hệ Thống Gửi Email Tự Động với Cronjob

## 🚀 Tính Năng

### 1. **Cronjob Tự Động**
- **Gửi email hàng ngày**: Mỗi ngày lúc 8:00 sáng gửi jobs phù hợp với skills của từng subscriber
- **Gửi email tổng kết tuần**: Thứ 2 hàng tuần lúc 9:00 sáng gửi tất cả jobs hiện có

### 2. **Quản Lý Cronjob**
- Bật/tắt cronjob
- Xem trạng thái cronjob
- Chạy cronjob ngay lập tức
- Cập nhật lịch trình cronjob

## 📋 API Endpoints

### **Test Email Thủ Công**
```bash
GET /api/v1/email/cron-test
```
Gửi email test ngay lập tức (không cần đợi cronjob)

### **Xem Trạng Thái Cronjobs**
```bash
GET /api/v1/email/cron-status
```
Trả về trạng thái tất cả cronjobs (đang chạy, lần chạy tiếp theo, lần chạy cuối)

### **Bật Cronjob**
```bash
POST /api/v1/email/cron-start/{jobName}
```
Các jobName có thể sử dụng:
- `daily-job-notification` - Cronjob gửi email hàng ngày
- `weekly-job-summary` - Cronjob gửi tổng kết tuần

### **Tắt Cronjob**
```bash
POST /api/v1/email/cron-stop/{jobName}
```

### **Chạy Cronjob Ngay**
```bash
POST /api/v1/email/cron-run/{jobName}
```
Chạy cronjob ngay lập tức mà không cần đợi thời gian định sẵn

### **Cập Nhật Lịch Trình**
```bash
POST /api/v1/email/cron-schedule/{jobName}
Body: {
  "schedule": "0 10 * * *"
}
```

## ⏰ Cron Pattern

| Pattern | Ý nghĩa | Ví dụ |
|---------|---------|-------|
| `0 8 * * *` | Mỗi ngày lúc 8:00 | Gửi email hàng ngày |
| `0 9 * * 1` | Thứ 2 hàng tuần lúc 9:00 | Gửi email tổng kết |
| `0 */2 * * *` | Mỗi 2 tiếng | Gửi email 2 tiếng 1 lần |
| `0 12 1 * *` | Ngày 1 hàng tháng lúc 12:00 | Gửi email hàng tháng |
| `0 0 * * 0` | Chủ nhật hàng tuần lúc 0:00 | Gửi email cuối tuần |

## 🎯 Logic Gửi Email

### **Daily Job Notification** (Hàng ngày)
1. Lấy tất cả subscribers từ database
2. Với mỗi subscriber:
   - Lấy danh sách skills của họ
   - Tìm jobs có skills trùng khớp
   - Nếu có jobs phù hợp → Gửi email với template `new-job`
   - Nếu không có jobs phù hợp → Bỏ qua
3. Log kết quả gửi email

### **Weekly Job Summary** (Hàng tuần)  
1. Lấy tất cả subscribers
2. Lấy tất cả jobs hiện có (không filter theo skills)
3. Gửi email tổng kết cho tất cả subscribers với template `job`

## 📧 Email Templates

### **Template: new-job.hbs**
- Dành cho email hàng ngày
- Hiển thị jobs phù hợp với skills
- Cá nhân hóa theo từng subscriber

### **Template: job.hbs**  
- Dành cho email tổng kết tuần
- Hiển thị tất cả jobs
- Tổng quan về thị trường việc làm

## 🛠️ Cấu Hình

### **File: cron.config.ts**
```typescript
export const CRON_SCHEDULES = {
  DAILY_JOB_NOTIFICATION: '0 8 * * *',    // 8:00 hàng ngày
  WEEKLY_JOB_SUMMARY: '0 9 * * 1',        // 9:00 thứ 2
  TIMEZONE: 'Asia/Ho_Chi_Minh'
};
```

## 📊 Logs

Hệ thống sẽ ghi log chi tiết:
- ✅ Email gửi thành công
- ⚠️ Cảnh báo (không có subscribers/jobs)  
- ❌ Lỗi trong quá trình gửi
- 🎉 Tổng kết sau khi hoàn thành

## 🔧 Cách Sử dụng

### **1. Khởi động server**
```bash
npm run start:dev
```
Cronjobs sẽ tự động được đăng ký và chạy theo lịch

### **2. Test ngay lập tức**
```bash
curl http://localhost:8000/api/v1/email/cron-test
```

### **3. Xem trạng thái**
```bash
curl http://localhost:8000/api/v1/email/cron-status
```

### **4. Tắt cronjob hàng ngày**
```bash
curl -X POST http://localhost:8000/api/v1/email/cron-stop/daily-job-notification
```

### **5. Bật lại cronjob**
```bash
curl -X POST http://localhost:8000/api/v1/email/cron-start/daily-job-notification
```

## 🎯 Lưu Ý

1. **Timezone**: Tất cả cronjobs chạy theo giờ Việt Nam (Asia/Ho_Chi_Minh)
2. **Email Provider**: Cần cấu hình đúng SMTP trong `.env`
3. **Performance**: Với nhiều subscribers, nên cân nhắc batch processing
4. **Error Handling**: Nếu gửi email lỗi, cronjob vẫn tiếp tục với subscribers khác

## 🚨 Troubleshooting

### **Cronjob không chạy**
- Kiểm tra ScheduleModule đã được import trong AppModule
- Kiểm tra timezone có đúng không
- Xem logs để kiểm tra lỗi

### **Email không gửi được**
- Kiểm tra cấu hình SMTP trong `.env`
- Kiểm tra template Handlebars có lỗi không
- Xem logs chi tiết lỗi

### **Performance chậm**
- Giảm số lượng jobs query (pagination)
- Sử dụng batch processing cho nhiều emails
- Cân nhắc queue system cho production
