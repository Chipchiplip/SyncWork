# EXCEL IMPORT TEMPLATE
## Hướng dẫn Import dữ liệu từ Excel

---

## FORMAT BẮT BUỘC

File Excel phải có **EXACT** các cột sau (theo thứ tự):

| ListName | CardKey | Title | Description | ChecklistItem | Priority | MemberSlot | Labels | DueDate |
|----------|---------|-------|-------------|---------------|----------|------------|--------|---------|

---

## EXCEL TEMPLATE MẪU (FULL)

Dưới đây là template mẫu với **15 dòng ví dụ** đầy đủ:

| ListName | CardKey | Title | Description | ChecklistItem | Priority | MemberSlot | Labels | DueDate |
|----------|---------|-------|-------------|---------------|----------|------------|--------|---------|
| To Do | CARD-001 | Implement Google OAuth Login | Add Google OAuth2 authentication flow with JWT token generation | Setup OAuth credentials in Google Console | High | member1 | urgent,backend | 2024-02-15 |
| To Do | CARD-001 | Implement Google OAuth Login | Add Google OAuth2 authentication flow with JWT token generation | Create login endpoint | High | member1 | urgent,backend | 2024-02-15 |
| To Do | CARD-001 | Implement Google OAuth Login | Add Google OAuth2 authentication flow with JWT token generation | Implement JWT token generation | High | member1 | urgent,backend | 2024-02-15 |
| To Do | CARD-001 | Implement Google OAuth Login | Add Google OAuth2 authentication flow with JWT token generation | Write unit tests | High | member1 | urgent,backend | 2024-02-15 |
| In Progress | CARD-002 | Design REST API for Boards | Create complete REST API specification for board management | Design board CRUD endpoints | Medium | member2 | task,backend | 2024-02-20 |
| In Progress | CARD-002 | Design REST API for Boards | Create complete REST API specification for board management | Design member management endpoints | Medium | member2 | task,backend | 2024-02-20 |
| In Progress | CARD-002 | Design REST API for Boards | Create complete REST API specification for board management | Write API documentation | Medium | member2 | task,backend | 2024-02-20 |
| In Progress | CARD-003 | Create Dashboard UI | Build main dashboard with board overview and statistics | Design dashboard layout | Low | member3 | ui,frontend | 2024-02-25 |
| In Progress | CARD-003 | Create Dashboard UI | Build main dashboard with board overview and statistics | Implement board cards grid | Low | member3 | ui,frontend | 2024-02-25 |
| In Progress | CARD-003 | Create Dashboard UI | Build main dashboard with board overview and statistics | Add statistics widgets | Low | member3 | ui,frontend | 2024-02-25 |
| In Progress | CARD-003 | Create Dashboard UI | Build main dashboard with board overview and statistics | Implement dark mode toggle | Low | member3 | ui,frontend | 2024-02-25 |
| Done | CARD-004 | Setup Database Schema | Create database tables for users, boards, cards, etc. | Create users table | Medium | member4 | task,database | 2024-02-10 |
| Done | CARD-004 | Setup Database Schema | Create database tables for users, boards, cards, etc. | Create boards table | Medium | member4 | task,database | 2024-02-10 |
| Done | CARD-004 | Setup Database Schema | Create database tables for users, boards, cards, etc. | Create cards table | Medium | member4 | task,database | 2024-02-10 |
| Waiting | CARD-005 | Implement Excel Import Feature | Build feature to import cards from Excel file | Parse Excel file format | High | member5 | urgent,backend | 2024-02-28 |

---

## GIẢI THÍCH CÁCH HOẠT ĐỘNG

### 1. CẤU TRÚC DỮ LIỆU

#### **ListName** (Bắt buộc)
- Tên của List (cột) trong board
- Nếu List chưa tồn tại → tự động tạo List mới
- Ví dụ: "To Do", "In Progress", "Done", "Waiting"

#### **CardKey** (Bắt buộc)
- **Key duy nhất** để nhóm các dòng thành 1 Card
- **Cùng CardKey = cùng 1 Card**
- Ví dụ: "CARD-001", "CARD-002", "FEATURE-123"

#### **Title** (Bắt buộc)
- Tiêu đề của Card
- Chỉ lấy từ **dòng đầu tiên** của mỗi CardKey
- Các dòng sau cùng CardKey → bỏ qua Title (dùng Title từ dòng đầu)

#### **Description** (Tùy chọn)
- Mô tả chi tiết của Card
- Chỉ lấy từ **dòng đầu tiên** của mỗi CardKey
- Các dòng sau cùng CardKey → bỏ qua Description

#### **ChecklistItem** (Tùy chọn)
- **Mỗi dòng = 1 checklist item**
- Nếu cùng CardKey có nhiều dòng → tạo nhiều checklist items
- Nếu để trống → không tạo checklist item cho dòng đó

#### **Priority** (Tùy chọn)
- Giá trị: `Low`, `Medium`, `High` (case-insensitive)
- Chỉ lấy từ **dòng đầu tiên** của mỗi CardKey
- Mặc định: `Medium` nếu để trống

#### **MemberSlot** (Tùy chọn)
- Chỉ nhận giá trị: `member1`, `member2`, `member3`, `member4`, `member5`
- Map với board members theo thứ tự:
  - `member1` → Board member thứ 1 (sau owner)
  - `member2` → Board member thứ 2
  - `member3` → Board member thứ 3
  - `member4` → Board member thứ 4
  - `member5` → Board member thứ 5
- Chỉ lấy từ **dòng đầu tiên** của mỗi CardKey
- Nếu member không tồn tại → bỏ qua assignment

#### **Labels** (Tùy chọn)
- Danh sách labels, phân cách bằng dấu phẩy: `task,urgent,ui`
- Tự động tạo labels mới nếu chưa tồn tại trong board
- Chỉ lấy từ **dòng đầu tiên** của mỗi CardKey
- Ví dụ: `urgent,backend`, `ui,frontend`, `task`

#### **DueDate** (Tùy chọn)
- Format: `YYYY-MM-DD` (ví dụ: `2024-02-15`)
- Chỉ lấy từ **dòng đầu tiên** của mỗi CardKey
- Nếu format sai → bỏ qua hoặc báo lỗi

---

### 2. QUY TRÌNH IMPORT

#### **Bước 1: Upload File**
- User upload file Excel (.xlsx, .xls)
- Backend validate format và cấu trúc

#### **Bước 2: Parse & Validate**
- Đọc từng dòng trong Excel
- Validate:
  - CardKey không được trống
  - Title không được trống (ở dòng đầu mỗi CardKey)
  - ListName phải hợp lệ
  - Priority phải là Low/Medium/High
  - MemberSlot phải là member1-5
  - DueDate phải đúng format YYYY-MM-DD

#### **Bước 3: Group by CardKey**
- Nhóm tất cả dòng có cùng CardKey thành 1 Card
- Dòng đầu tiên của mỗi CardKey → lấy: Title, Description, Priority, MemberSlot, Labels, DueDate
- Tất cả dòng của CardKey → lấy ChecklistItem (nếu có)

#### **Bước 4: Create Resources**
- **Lists**: Tạo List mới nếu ListName chưa tồn tại
- **Labels**: Tạo Label mới nếu chưa tồn tại trong board
- **Cards**: Tạo Card với thông tin từ dòng đầu tiên
- **ChecklistItems**: Tạo checklist items từ các dòng còn lại
- **Assignments**: Gán member nếu MemberSlot hợp lệ

#### **Bước 5: Return Summary**
```json
{
  "listsCreated": 3,
  "cardsCreated": 5,
  "checklistItemsCreated": 15,
  "labelsCreated": 8,
  "errors": []
}
```

---

### 3. VÍ DỤ CHI TIẾT

#### **Ví dụ 1: Card với 4 checklist items**

Excel input:
```
ListName: To Do
CardKey: CARD-001
Title: Implement Login
Description: Add OAuth login
ChecklistItem: Setup OAuth (dòng 1)
ChecklistItem: Create endpoint (dòng 2)
ChecklistItem: Generate JWT (dòng 3)
ChecklistItem: Write tests (dòng 4)
Priority: High
MemberSlot: member1
Labels: urgent,backend
DueDate: 2024-02-15
```

Kết quả:
- ✅ Tạo 1 Card: "Implement Login"
- ✅ Card có 4 checklist items
- ✅ Card được assign cho member1
- ✅ Card có 2 labels: "urgent", "backend"
- ✅ Card có due date: 2024-02-15
- ✅ Card có priority: High

#### **Ví dụ 2: Card không có checklist**

Excel input:
```
ListName: Done
CardKey: CARD-004
Title: Setup Database
Description: Create tables
ChecklistItem: (trống)
Priority: Medium
MemberSlot: member4
Labels: task,database
DueDate: 2024-02-10
```

Kết quả:
- ✅ Tạo 1 Card: "Setup Database"
- ✅ Card không có checklist items
- ✅ Card được assign cho member4
- ✅ Card có 2 labels: "task", "database"

---

### 4. RULES & VALIDATION

#### **Rules:**
1. **CardKey là unique identifier** → Cùng CardKey = cùng 1 Card
2. **Dòng đầu tiên của CardKey** → Chứa metadata của Card (Title, Description, Priority, etc.)
3. **Các dòng sau của CardKey** → Chỉ dùng để tạo checklist items
4. **ListName không tồn tại** → Tự động tạo List mới
5. **Label không tồn tại** → Tự động tạo Label mới với màu mặc định
6. **MemberSlot không hợp lệ** → Bỏ qua assignment
7. **Priority không hợp lệ** → Mặc định là Medium
8. **DueDate sai format** → Bỏ qua hoặc báo lỗi

#### **Validation Errors:**
- ❌ CardKey trống → **Lỗi**
- ❌ Title trống (ở dòng đầu CardKey) → **Lỗi**
- ❌ ListName trống → **Lỗi**
- ❌ Priority không phải Low/Medium/High → **Cảnh báo, dùng Medium**
- ❌ MemberSlot không phải member1-5 → **Cảnh báo, bỏ qua**
- ❌ DueDate sai format → **Cảnh báo, bỏ qua**
- ❌ Labels format sai (không phải comma-separated) → **Cảnh báo, bỏ qua**

---

### 5. MAPPING MEMBER SLOT

**MemberSlot** → **Board Member** mapping:

| MemberSlot | Board Member Position |
|------------|----------------------|
| member1 | Board member thứ 1 (index 0 trong danh sách members, sau owner) |
| member2 | Board member thứ 2 (index 1) |
| member3 | Board member thứ 3 (index 2) |
| member4 | Board member thứ 4 (index 3) |
| member5 | Board member thứ 5 (index 4) |

**Lưu ý:**
- Owner không được assign qua MemberSlot
- Nếu board có ít hơn 5 members → member4, member5 sẽ không được assign
- MemberSlot được map theo thứ tự members trong board (không phải theo ID)

---

### 6. LABEL CREATION

Khi import, nếu label chưa tồn tại:
- **Tự động tạo label mới** với:
  - Name: Tên label từ Excel (trim whitespace)
  - Color: Màu mặc định theo thứ tự (hoặc random)
  - BoardId: Board đang import

**Ví dụ:**
- Excel có label: `urgent,backend`
- Nếu "urgent" chưa tồn tại → Tạo label "urgent" với màu #ff0000
- Nếu "backend" chưa tồn tại → Tạo label "backend" với màu #0079bf

---

### 7. CHECKLIST ITEMS

- **Mỗi dòng có ChecklistItem** → Tạo 1 checklist item
- **ChecklistItem trống** → Bỏ qua, không tạo item
- **Thứ tự checklist items** → Theo thứ tự dòng trong Excel
- **Position** → Tự động set theo thứ tự (0, 1, 2, ...)

**Ví dụ:**
```
CardKey: CARD-001
Dòng 1: ChecklistItem = "Setup OAuth" → Position 0
Dòng 2: ChecklistItem = "Create endpoint" → Position 1
Dòng 3: ChecklistItem = "" → Bỏ qua
Dòng 4: ChecklistItem = "Write tests" → Position 2
```

---

### 8. ERROR HANDLING

#### **Row-level Errors:**
- Mỗi dòng lỗi sẽ được ghi lại với:
  - Row number
  - Column name
  - Error message

#### **Response Format:**
```json
{
  "importId": "import_123",
  "summary": {
    "listsCreated": 3,
    "cardsCreated": 5,
    "checklistItemsCreated": 15,
    "labelsCreated": 8,
    "errors": [
      {
        "row": 5,
        "column": "CardKey",
        "message": "CardKey is required"
      },
      {
        "row": 10,
        "column": "DueDate",
        "message": "Invalid date format. Expected YYYY-MM-DD"
      }
    ]
  }
}
```

#### **Partial Import:**
- Nếu một số dòng lỗi → Vẫn import các dòng hợp lệ
- Dòng lỗi sẽ được báo trong `errors` array
- User có thể sửa file và import lại

---

### 9. BEST PRACTICES

#### **Để import thành công:**
1. ✅ Đảm bảo CardKey là unique cho mỗi Card
2. ✅ Dòng đầu tiên của mỗi CardKey phải có đầy đủ Title
3. ✅ ChecklistItem chỉ cần điền ở các dòng cần tạo item
4. ✅ MemberSlot phải đúng format member1-5
5. ✅ Priority phải là Low, Medium, hoặc High
6. ✅ DueDate phải đúng format YYYY-MM-DD
7. ✅ Labels phân cách bằng dấu phẩy, không có khoảng trắng thừa

#### **Tránh:**
- ❌ Dùng cùng CardKey cho các Card khác nhau
- ❌ Để trống CardKey hoặc Title
- ❌ Dùng MemberSlot không hợp lệ (member6, member0, etc.)
- ❌ Format DueDate sai (DD-MM-YYYY, MM/DD/YYYY, etc.)
- ❌ Labels có ký tự đặc biệt không hợp lệ

---

### 10. DOWNLOAD TEMPLATE

**Endpoint**: `GET /boards/{boardId}/import/template`

**Response**: Excel file (.xlsx) với:
- Header row đã format sẵn
- 5-10 dòng ví dụ mẫu
- Data validation cho Priority và MemberSlot
- Format date cho DueDate column

**Usage:**
1. Download template từ API
2. Điền dữ liệu theo format
3. Upload lại qua `POST /boards/{boardId}/import/excel`

---

## TÓM TẮT

| Field | Bắt buộc | Lấy từ | Ghi chú |
|-------|----------|--------|---------|
| ListName | ✅ | Mọi dòng | Tự động tạo nếu chưa có |
| CardKey | ✅ | Mọi dòng | Key để group dòng thành Card |
| Title | ✅ | Dòng đầu CardKey | Tiêu đề Card |
| Description | ❌ | Dòng đầu CardKey | Mô tả Card |
| ChecklistItem | ❌ | Mọi dòng | Mỗi dòng = 1 item |
| Priority | ❌ | Dòng đầu CardKey | Low/Medium/High |
| MemberSlot | ❌ | Dòng đầu CardKey | member1-5 |
| Labels | ❌ | Dòng đầu CardKey | Comma-separated |
| DueDate | ❌ | Dòng đầu CardKey | YYYY-MM-DD |

---

**Kết thúc tài liệu Excel Import Template**

