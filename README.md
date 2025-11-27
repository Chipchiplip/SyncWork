# Task Manager - Trello Style Application

Hệ thống quản lý công việc kiểu Trello với Google OAuth authentication, được xây dựng bằng .NET Core 9.0 và React + TypeScript.

## 🏗️ Kiến Trúc Dự Án

### Backend (.NET Core 9.0)
- **Layered Monolith Architecture** - Chia thành các thư mục đóng vai trò như các tầng logic
- **Repository Pattern** - Tách biệt logic truy cập dữ liệu
- **Dependency Injection** - Quản lý phụ thuộc linh hoạt
- **JWT Authentication** - Bảo mật API với JWT tokens
- **SignalR** - Real-time updates cho notifications và board changes

### Frontend (React + Vite + TypeScript)
- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Zustand** - State management
- **React Query** - Server state management
- **Axios** - HTTP client

## 📁 Cấu Trúc Dự Án

```
Project/
├── backend/                 # .NET Core Backend
│   ├── Controllers/         # API Controllers (Presentation Layer)
│   ├── Services/           # Business Logic Layer
│   ├── Repositories/        # Data Access Layer
│   ├── Models/             # Domain Entities
│   ├── DTOs/               # Data Transfer Objects
│   ├── Interfaces/          # Service & Repository Interfaces
│   ├── Data/               # DbContext & Database Config
│   ├── Hubs/               # SignalR Hubs
│   ├── Program.cs          # Application Entry Point
│   └── appsettings.json    # Configuration
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── pages/          # Page Components
│   │   ├── services/       # API Services
│   │   ├── store/          # Zustand Stores
│   │   ├── hooks/          # Custom Hooks
│   │   ├── types/          # TypeScript Types
│   │   └── App.tsx         # Main App Component
│   ├── package.json
│   └── vite.config.ts
│
├── REST_API_SPEC.md        # Complete REST API Documentation
└── EXCEL_IMPORT_TEMPLATE.md # Excel Import Guide
```

## 🚀 Quick Start

Xem file **SETUP_GUIDE.md** để biết hướng dẫn chi tiết setup và khởi chạy dự án.

### Tóm tắt nhanh:

**Backend:**
```bash
cd backend
dotnet ef migrations add InitialCreate
dotnet ef database update
dotnet run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🚀 Setup & Installation

### Prerequisites
- .NET 9.0 SDK
- Node.js 18+ và npm/yarn
- SQL Server (hoặc SQL Server Express)
- Redis (optional, for caching)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Restore packages:**
   ```bash
   dotnet restore
   ```

3. **Update connection string in `appsettings.json`:**
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=TaskManagerDB;Trusted_Connection=True;TrustServerCertificate=True;"
     }
   }
   ```

4. **Create database migration:**
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

5. **Configure Google OAuth:**
   - Tạo Google OAuth credentials tại [Google Cloud Console](https://console.cloud.google.com/)
   - Cập nhật `GoogleOAuth.ClientId` và `GoogleOAuth.ClientSecret` trong `appsettings.json`

6. **Run backend:**
   ```bash
   dotnet run
   ```
   Backend sẽ chạy tại `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Frontend sẽ chạy tại `http://localhost:5173`

## 📚 API Documentation

Xem file `REST_API_SPEC.md` để biết chi tiết về tất cả các endpoints.

### Base URL
```
http://localhost:5000/api
```

### Authentication
Tất cả endpoints (trừ OAuth callback) yêu cầu JWT token trong header:
```
Authorization: Bearer <jwt_token>
```

## 📊 Excel Import

Xem file `EXCEL_IMPORT_TEMPLATE.md` để biết cách import dữ liệu từ Excel.

## 🛠️ Development Workflow

### Thêm một tính năng mới:

1. **Database**: Tạo Model và Migration
   ```bash
   dotnet ef migrations add AddNewFeature
   dotnet ef database update
   ```

2. **Interface**: Định nghĩa Interface trong `Interfaces/`

3. **Repository**: Implement Repository trong `Repositories/`

4. **Service**: Implement Service trong `Services/`

5. **DTO**: Tạo DTOs trong `DTOs/`

6. **Controller**: Tạo Controller trong `Controllers/`

7. **Frontend**: Tạo service, component và page tương ứng

## 🧪 Testing

### Backend Testing
```bash
dotnet test
```

### Frontend Testing
```bash
npm test
```

## 📦 Build for Production

### Backend
```bash
dotnet publish -c Release -o ./publish
```

### Frontend
```bash
npm run build
```

## 🔐 Security

- JWT tokens với expiration
- Google OAuth 2.0 authentication
- CORS configuration
- Input validation
- SQL injection protection (Entity Framework)

## 📝 Notes

- Backend sử dụng **Layered Monolith** pattern thay vì microservices để đơn giản hóa cho team nhỏ
- Tất cả Services và Repositories đều có Interface để dễ dàng test và maintain
- Frontend sử dụng Zustand cho client state và React Query cho server state
- SignalR được sử dụng cho real-time notifications và board updates

## 🤝 Contributing

1. Tạo branch mới từ `main`
2. Commit changes với message rõ ràng
3. Push và tạo Pull Request

## 📄 License

MIT License

