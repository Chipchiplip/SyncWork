# Architecture Guide - Task Manager

Tài liệu này mô tả chi tiết kiến trúc của dự án **Task Manager**, được thiết kế để đảm bảo tính chuyên nghiệp, dễ bảo trì và mở rộng.

## 1. Tổng Quan Kiến Trúc (High-Level Architecture)

Dự án sử dụng mô hình **Client-Server** tách biệt:
- **Backend**: ASP.NET Core 9.0 Web API
- **Frontend**: React (Vite) + TypeScript
- **Database**: SQL Server (Lưu trữ chính) + Redis (Caching)
- **Communication**: REST API (Request/Response) + SignalR (Real-time)

---

## 2. Cấu Trúc Backend (.NET Core)

Dự án sử dụng mô hình **Layered Monolith** (Đơn khối phân lớp). Thay vì chia thành nhiều Project vật lý (gây phức tạp không cần thiết cho team nhỏ), chúng ta chia thành các **Thư mục (Folder)** đóng vai trò như các tầng logic.

### Sơ đồ luồng dữ liệu:
```
Request → Controller → Service → Repository → Database
```

### Chi tiết các thư mục:

#### 📂 `Controllers/` (Presentation Layer)
- **Vai trò**: Nhận HTTP Request, validate dữ liệu đầu vào cơ bản, và gọi Service.
- **Nguyên tắc**: Controller nên "mỏng" (Thin Controller). Không viết logic nghiệp vụ (if/else phức tạp, tính toán) ở đây.
- **Ví dụ**: `AuthController`, `BoardsController`, `CardsController`.

#### 📂 `Services/` (Business Logic Layer)
- **Vai trò**: Chứa toàn bộ logic nghiệp vụ của ứng dụng.
- **Nguyên tắc**: Xử lý các quy tắc nghiệp vụ, gọi Repository để lấy dữ liệu, tính toán, và trả về kết quả cho Controller.
- **Ví dụ**: `AuthService` (Xử lý đăng nhập, tạo token), `BoardService` (Quản lý boards).

#### 📂 `Repositories/` (Data Access Layer)
- **Vai trò**: Giao tiếp trực tiếp với Database.
- **Nguyên tắc**: Chỉ thực hiện các câu lệnh CRUD (Create, Read, Update, Delete). Không chứa logic nghiệp vụ.
- **Pattern**: Sử dụng **Repository Pattern** để tách biệt logic truy cập dữ liệu khỏi logic nghiệp vụ. Giúp dễ dàng thay đổi database hoặc viết Unit Test.

#### 📂 `Models/` (Domain Layer)
- **Vai trò**: Định nghĩa các thực thể (Entities) ánh xạ với Database.
- **Ví dụ**: `User`, `Board`, `Card`, `List`.

#### 📂 `Interfaces/` (Abstraction)
- **Vai trò**: Định nghĩa các bản thiết kế (Contract) cho Service và Repository.
- **Lợi ích**: Giúp áp dụng **Dependency Injection (DI)**. Controller không phụ thuộc trực tiếp vào Service cụ thể, mà phụ thuộc vào Interface (`IAuthService`).

#### 📂 `DTOs/` (Data Transfer Objects)
- **Vai trò**: Các class dùng để truyền dữ liệu giữa các lớp (Client → Controller → Service).
- **Lợi ích**: Không lộ trực tiếp Entity của Database ra ngoài API (bảo mật và linh hoạt).
- **Ví dụ**: `LoginRequestDto`, `UserResponseDto`, `BoardResponseDto`.

#### 📂 `Data/`
- **Vai trò**: Chứa `DbContext` (Cấu hình Entity Framework) và Seed Data.

#### 📂 `Hubs/`
- **Vai trò**: Chứa các SignalR Hub để xử lý real-time (ví dụ: cập nhật giá coin theo thời gian thực).

---

## 3. Cấu Trúc Frontend (React + Vite)

Frontend nằm trong thư mục `frontend/` và tuân theo cấu trúc hiện đại của React.

#### 📂 `src/`
- **`components/`**: Các UI component tái sử dụng (Button, Input, Modal).
- **`pages/`**: Các trang chính của ứng dụng (Login, Dashboard, Board).
- **`services/`**: Các hàm gọi API (Axios/Fetch) đến Backend. Tương tự như Repository bên Backend.
- **`store/`**: Quản lý state toàn cục (Zustand).
- **`hooks/`**: Custom hooks để tái sử dụng logic.
- **`types/`**: Định nghĩa TypeScript Interfaces/Types.

---

## 4. Các Pattern Quan Trọng Cần Áp Dụng

### 1. Dependency Injection (DI)
- **Là gì**: Kỹ thuật tiêm các phụ thuộc vào class thay vì khởi tạo trực tiếp.
- **Cách dùng**: Đăng ký Service/Repository trong `Program.cs`:
  ```csharp
  builder.Services.AddScoped<IAuthService, AuthService>();
  builder.Services.AddScoped<IUserRepository, UserRepository>();
  ```
- **Lợi ích**: Dễ bảo trì, dễ test, giảm sự phụ thuộc chặt chẽ (Loose Coupling).

### 2. Repository Pattern
- **Là gì**: Lớp trung gian giữa Business Logic và Data Access.
- **Lợi ích**: Nếu sau này bạn đổi từ SQL Server sang MongoDB, bạn chỉ cần sửa code trong Repository, không ảnh hưởng đến Service hay Controller.

### 3. DTO (Data Transfer Object)
- **Là gì**: Các class dùng để truyền dữ liệu giữa các lớp (Client → Controller → Service).
- **Lợi ích**: Không lộ trực tiếp Entity của Database ra ngoài API (bảo mật và linh hoạt).
- **Ví dụ**: `LoginRequestDto`, `UserResponseDto`.

### 4. Asynchronous Programming (Async/Await)
- **Nguyên tắc**: Luôn sử dụng `async/await` cho các tác vụ I/O (Database, File, API Call) để không chặn luồng chính, tăng hiệu năng.

---

## 5. Quy Trình Phát Triển 1 Tính Năng (Workflow)

Khi làm một tính năng mới (ví dụ: "Tạo Card"), hãy làm theo thứ tự:

1. **Database**: Tạo Model `Card` và chạy Migration.
2. **Interface**: Định nghĩa `ICardRepository` và `ICardService`.
3. **Repository**: Implement `CardRepository` (Lưu card vào DB).
4. **Service**: Implement `CardService` (Kiểm tra quyền, gọi Repository lưu card).
5. **DTO**: Tạo `CreateCardDto`, `CardResponseDto`.
6. **Controller**: Tạo `CardsController`, inject `ICardService`, tạo API `POST /api/cards`.
7. **Frontend**: Tạo UI form tạo card và gọi API.

---

## 6. Authentication Flow

### Google OAuth Flow:
1. User click "Login with Google"
2. Frontend gọi `POST /api/auth/google/login` → Nhận auth URL
3. Redirect user đến Google OAuth
4. Google redirect về `/api/auth/google/callback?code=...`
5. Backend xử lý callback, tạo/update user, phát JWT token
6. Frontend lưu token vào localStorage và Zustand store

### JWT Token Flow:
- Access Token: Expires sau 60 phút
- Refresh Token: Expires sau 7 ngày
- Frontend tự động refresh token khi access token hết hạn

---

## 7. Real-time Updates (SignalR)

### Notification Hub:
- User join group: `user_{userId}`
- Server gửi notification: `SendNotification(userId, notification)`

### Board Hub:
- User join group: `board_{boardId}`
- Server broadcast updates: `CardUpdated`, `CardMoved`, etc.

---

## 8. Tổng Kết

Để áp dụng cho dự án khác chuyên nghiệp:
1. **Đừng viết tất cả code vào Controller.** Hãy chia nhỏ thành Service và Repository.
2. **Dùng Interface** cho mọi Service/Repository.
3. **Đặt tên nhất quán** (Tiếng Anh, PascalCase cho Class, camelCase cho biến).
4. **Tách biệt Frontend và Backend** rõ ràng.
5. **Sử dụng DTOs** thay vì trả về Entity trực tiếp.

Cấu trúc này đủ đơn giản cho team nhỏ nhưng cũng đủ mạnh mẽ để mở rộng lên các hệ thống lớn hơn.

