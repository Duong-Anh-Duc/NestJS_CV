# Analytics Integration Guide

## Tổng quan
Module Analytics đã được tích hợp vào hệ thống NestJS-CV để theo dõi và phân tích các hoạt động của người dùng.

## Các tính năng đã tích hợp

### 1. Backend Analytics
- **Analytics Entity**: Lưu trữ dữ liệu phân tích trong database
- **Analytics Service**: Xử lý logic nghiệp vụ cho analytics
- **Analytics Controller**: Cung cấp API endpoints cho việc truy vấn dữ liệu

### 2. Tự động theo dõi Events
Các events sau được tự động track:

#### User Events
- `USER_CREATED`: Khi tạo user mới
- `USER_UPDATED`: Khi cập nhật thông tin user  
- `USER_REGISTERED`: Khi user đăng ký tài khoản
- `USER_LOGIN`: Khi user đăng nhập

#### Job Events
- `JOB_CREATED`: Khi tạo job mới
- `JOB_UPDATED`: Khi cập nhật job
- `JOB_VIEWED`: Khi xem chi tiết job

### 3. API Endpoints

#### Dashboard Analytics
```
GET /api/v1/analytics/dashboard
```
Trả về dữ liệu tổng hợp cho dashboard admin

#### Chi tiết Analytics
```
GET /api/v1/analytics
GET /api/v1/analytics/stats/events
GET /api/v1/analytics/stats/daily?days=30
GET /api/v1/analytics/stats/users?limit=10
```

### 4. Frontend Integration

#### Analytics Dashboard
- **Component**: `AnalyticsDashboard` trong `/src/components/admin/analytics/`
- **Page**: `/admin/analytics`
- **Features**:
  - Thống kê tổng quan (Total Events, Event Types, Active Users)
  - Biểu đồ tròn phân loại events
  - Biểu đồ đường hoạt động theo ngày
  - Bảng top users hoạt động nhiều nhất

#### Cách sử dụng
1. Đăng nhập với quyền admin
2. Vào menu "Analytics" 
3. Xem các thống kê và biểu đồ

## Cấu trúc Files

### Backend
```
src/analytics/
├── analytics.entity.ts       # Database entity
├── analytics.service.ts      # Business logic  
├── analytics.controller.ts   # API endpoints
├── analytics.module.ts       # Module configuration
└── dto/
    ├── create-analytics.dto.ts
    └── get-analytics.dto.ts
```

### Frontend
```
src/components/admin/analytics/
└── analytics.dashboard.tsx   # Dashboard component

src/pages/admin/
└── analytics.tsx             # Analytics page
```

## Database Schema

Bảng `analytics`:
- `id`: Primary key
- `event_type`: Loại event (VD: USER_LOGIN, JOB_VIEWED)
- `resource_id`: ID của resource liên quan (user_id, job_id, etc.)
- `user_id`: ID của user thực hiện hành động
- `session_id`: Session ID (optional)
- `ip_address`: IP address của user
- `user_agent`: Browser/device info
- `metadata`: Dữ liệu bổ sung (JSON)
- `created_at`: Thời gian tạo
- `updated_at`: Thời gian cập nhật

## Cách mở rộng

### Thêm Event mới
1. Trong service cần track, inject `AnalyticsService`
2. Gọi `analyticsService.trackEvent()` với thông tin event

Ví dụ:
```typescript
await this.analyticsService.trackEvent({
  event_type: 'CUSTOM_EVENT',
  resource_id: 'resource_123',
  user_id: user._id.toString(),
  metadata: {
    customField: 'customValue'
  }
});
```

### Thêm biểu đồ mới
1. Thêm API endpoint mới trong `AnalyticsController`
2. Thêm method tương ứng trong `AnalyticsService`
3. Cập nhật frontend component để hiển thị

## Dependencies

### Backend
- `@nestjs/typeorm`: ORM integration
- `typeorm`: Database operations

### Frontend
- `recharts`: Biểu đồ
- `antd`: UI components

## Migration

Chạy migration để tạo bảng analytics:
```bash
npm run migration:run
```

## Performance Notes

- Analytics data có thể tăng nhanh, nên có chiến lược dọn dẹp/archive
- Các query phức tạp có thể cần index bổ sung
- Có thể sử dụng background jobs cho heavy analytics processing

## Next Steps

1. Thêm real-time analytics với WebSocket
2. Export analytics data ra file
3. Thêm alerts khi có bất thường
4. Tích hợp với external analytics services (Google Analytics, etc.)
5. Thêm analytics cho frontend interactions (clicks, page views)
