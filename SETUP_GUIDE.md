# Hướng Dẫn Setup và Khởi Chạy Dự Án

## Yêu Cầu Hệ Thống

- .NET 9.0 SDK
- Node.js 18+ và npm/yarn
- SQL Server (hoặc SQL Server Express)
- Google OAuth Credentials (tùy chọn cho development)

## Bước 1: Setup Backend

### 1.1. Cấu hình Database

1. Mở `backend/appsettings.json`
2. Cập nhật connection string:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=TaskManagerDB;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

### 1.2. Cấu hình Google OAuth (Tùy chọn)

1. Tạo Google OAuth credentials tại [Google Cloud Console](https://console.cloud.google.com/)
2. Cập nhật trong `backend/appsettings.json`:
```json
{
  "GoogleOAuth": {
    "ClientId": "YOUR_GOOGLE_CLIENT_ID",
    "ClientSecret": "YOUR_GOOGLE_CLIENT_SECRET",
    "RedirectUri": "http://localhost:5000/api/auth/google/callback"
  }
}
```

**Lưu ý**: Đảm bảo Redirect URI trong Google Console khớp với `RedirectUri` trong appsettings.json

### 1.3. Tạo Database và Migrations

```bash
cd backend
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### 1.4. Chạy Backend

```bash
cd backend
dotnet run
```

Backend sẽ chạy tại: `http://localhost:5000`

Swagger UI: `http://localhost:5000/swagger`

## Bước 2: Setup Frontend

### 2.1. Cài đặt Dependencies

```bash
cd frontend
npm install
```

### 2.2. Cấu hình API Base URL

File `frontend/src/services/api.ts` đã được cấu hình để proxy đến `http://localhost:5000/api` thông qua Vite proxy.

### 2.3. Chạy Frontend

```bash
cd frontend
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

## Bước 3: Kiểm Tra

1. Mở browser tại `http://localhost:5173`
2. Click "Login with Google"
3. Đăng nhập bằng Google account
4. Tạo board đầu tiên
5. Tạo list và card

## Troubleshooting

### Lỗi Database Connection

- Kiểm tra SQL Server đang chạy
- Kiểm tra connection string trong `appsettings.json`
- Đảm bảo database `TaskManagerDB` đã được tạo

### Lỗi Google OAuth

- Kiểm tra ClientId và ClientSecret đã đúng
- Kiểm tra Redirect URI trong Google Console khớp với appsettings.json
- Đảm bảo OAuth consent screen đã được cấu hình

### Lỗi CORS

- Kiểm tra CORS policy trong `Program.cs` đã cho phép `http://localhost:5173`
- Kiểm tra frontend đang chạy đúng port

### Lỗi JWT Token

- Kiểm tra SecretKey trong `appsettings.json` đủ dài (ít nhất 32 ký tự)
- Kiểm tra token expiration settings

## Cấu Trúc Thư Mục Quan Trọng

```
backend/
  Controllers/     # API endpoints
  Services/        # Business logic
  Repositories/    # Data access
  Models/          # Database entities
  DTOs/           # Data transfer objects

frontend/
  src/
    pages/        # Page components
    components/   # Reusable components
    services/     # API services
    store/        # Zustand stores
```

## API Endpoints Chính

- `POST /api/auth/google/login` - Initiate Google login
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/boards` - Get user's boards
- `POST /api/boards` - Create board
- `GET /api/boards/{boardId}/lists` - Get board lists
- `POST /api/lists/{listId}/cards` - Create card

Xem `REST_API_SPEC.md` để biết đầy đủ API documentation.

## Development Tips

1. **Hot Reload**: Cả backend và frontend đều hỗ trợ hot reload
2. **Swagger**: Sử dụng Swagger UI để test API
3. **React DevTools**: Cài đặt React DevTools extension cho browser
4. **Database**: Sử dụng SQL Server Management Studio để xem dữ liệu

## Production Deployment

1. Build backend: `dotnet publish -c Release`
2. Build frontend: `npm run build`
3. Cấu hình production settings trong `appsettings.Production.json`
4. Setup reverse proxy (nginx/IIS) cho frontend
5. Cấu hình HTTPS và domain cho Google OAuth

