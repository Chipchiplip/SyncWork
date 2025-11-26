# REST API SPECIFICATION
## Trello-Style Task Management System

**Base URL**: `https://api.taskmanager.com/v1`

**Authentication**: All endpoints require JWT token in Authorization header (except OAuth callback)
```
Authorization: Bearer <jwt_token>
```

---

## 1. AUTH MODULE

### 1.1. Google OAuth Login
**POST** `/auth/google/login`

**Description**: Initiate Google OAuth login flow. Returns redirect URL.

**Auth**: None (public endpoint)

**Request Body**:
```json
{
  "redirectUri": "https://app.taskmanager.com/auth/callback"
}
```

**Response** (200):
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

**Error Cases**:
- 400: Invalid redirectUri

---

### 1.2. Google OAuth Callback
**GET** `/auth/google/callback`

**Description**: Handle Google OAuth callback, create/update user, return JWT.

**Auth**: None (public endpoint)

**Query Params**:
- `code` (required): OAuth authorization code
- `state` (optional): CSRF state token

**Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_string",
  "user": {
    "id": "user_123",
    "googleId": "google_456",
    "name": "John Doe",
    "email": "john@example.com",
    "avatarUrl": "https://lh3.googleusercontent.com/...",
    "telegramChatId": null,
    "createdAt": "2024-01-15T10:00:00Z",
    "lastLoginAt": "2024-01-20T14:30:00Z",
    "role": "user"
  }
}
```

**Error Cases**:
- 400: Invalid code or state
- 401: OAuth verification failed
- 500: Google API error

---

### 1.3. Refresh Token
**POST** `/auth/refresh`

**Description**: Refresh JWT token using refresh token.

**Auth**: None (but requires refresh token)

**Request Body**:
```json
{
  "refreshToken": "refresh_token_string"
}
```

**Response** (200):
```json
{
  "token": "new_jwt_token",
  "refreshToken": "new_refresh_token"
}
```

**Error Cases**:
- 401: Invalid or expired refresh token

---

### 1.4. Logout
**POST** `/auth/logout`

**Description**: Invalidate refresh token (optional server-side logout).

**Auth**: Require JWT

**Request Body**:
```json
{
  "refreshToken": "refresh_token_string"
}
```

**Response** (204): No content

**Error Cases**:
- 401: Unauthorized

---

## 2. USERS MODULE

### 2.1. Get Current User Profile
**GET** `/users/me`

**Description**: Get authenticated user's profile.

**Auth**: Require JWT

**Response** (200):
```json
{
  "id": "user_123",
  "googleId": "google_456",
  "name": "John Doe",
  "email": "john@example.com",
  "avatarUrl": "https://lh3.googleusercontent.com/...",
  "telegramChatId": "123456789",
  "createdAt": "2024-01-15T10:00:00Z",
  "lastLoginAt": "2024-01-20T14:30:00Z",
  "role": "user"
}
```

**Error Cases**:
- 401: Unauthorized

---

### 2.2. Update User Profile
**PATCH** `/users/me`

**Description**: Update user's name, avatar, or Telegram chat ID.

**Auth**: Require JWT

**Request Body**:
```json
{
  "name": "John Updated",
  "avatarUrl": "https://example.com/avatar.jpg",
  "telegramChatId": "123456789"
}
```

**Response** (200):
```json
{
  "id": "user_123",
  "googleId": "google_456",
  "name": "John Updated",
  "email": "john@example.com",
  "avatarUrl": "https://example.com/avatar.jpg",
  "telegramChatId": "123456789",
  "createdAt": "2024-01-15T10:00:00Z",
  "lastLoginAt": "2024-01-20T14:30:00Z",
  "role": "user"
}
```

**Error Cases**:
- 400: Invalid input
- 401: Unauthorized

---

### 2.3. Get User by ID
**GET** `/users/{userId}`

**Description**: Get user profile by ID (for mentions, assignees, etc.).

**Auth**: Require JWT

**Path Params**:
- `userId` (required): User ID

**Response** (200):
```json
{
  "id": "user_123",
  "name": "John Doe",
  "email": "john@example.com",
  "avatarUrl": "https://lh3.googleusercontent.com/...",
  "role": "user"
}
```

**Error Cases**:
- 401: Unauthorized
- 404: User not found

---

### 2.4. Search Users
**GET** `/users/search`

**Description**: Search users by name or email (for mentions, assignments).

**Auth**: Require JWT

**Query Params**:
- `q` (required): Search query
- `limit` (optional, default: 20): Max results

**Response** (200):
```json
{
  "users": [
    {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "avatarUrl": "https://lh3.googleusercontent.com/..."
    }
  ],
  "total": 1
}
```

**Error Cases**:
- 400: Missing query parameter
- 401: Unauthorized

---

## 3. BOARDS MODULE

### 3.1. Create Board
**POST** `/boards`

**Description**: Create a new board. Creator becomes Owner.

**Auth**: Require JWT

**Request Body**:
```json
{
  "name": "Project Alpha",
  "description": "Main project board",
  "background": {
    "type": "color",
    "value": "#0079bf"
  }
}
```

**Response** (201):
```json
{
  "id": "board_123",
  "name": "Project Alpha",
  "description": "Main project board",
  "background": {
    "type": "color",
    "value": "#0079bf"
  },
  "ownerId": "user_123",
  "createdAt": "2024-01-20T10:00:00Z",
  "updatedAt": "2024-01-20T10:00:00Z"
}
```

**Error Cases**:
- 400: Invalid input
- 401: Unauthorized

---

### 3.2. Get Board by ID
**GET** `/boards/{boardId}`

**Description**: Get board details. Includes member count, list count.

**Auth**: Require JWT (must be member)

**Path Params**:
- `boardId` (required): Board ID

**Response** (200):
```json
{
  "id": "board_123",
  "name": "Project Alpha",
  "description": "Main project board",
  "background": {
    "type": "color",
    "value": "#0079bf"
  },
  "ownerId": "user_123",
  "memberCount": 5,
  "listCount": 3,
  "createdAt": "2024-01-20T10:00:00Z",
  "updatedAt": "2024-01-20T10:00:00Z"
}
```

**Error Cases**:
- 401: Unauthorized
- 403: Not a board member
- 404: Board not found

---

### 3.3. Update Board
**PATCH** `/boards/{boardId}`

**Description**: Update board name, description, or background. Requires Owner or Leader role.

**Auth**: Require JWT (Owner/Leader)

**Path Params**:
- `boardId` (required): Board ID

**Request Body**:
```json
{
  "name": "Project Alpha Updated",
  "description": "Updated description",
  "background": {
    "type": "image",
    "value": "https://example.com/bg.jpg"
  }
}
```

**Response** (200):
```json
{
  "id": "board_123",
  "name": "Project Alpha Updated",
  "description": "Updated description",
  "background": {
    "type": "image",
    "value": "https://example.com/bg.jpg"
  },
  "ownerId": "user_123",
  "createdAt": "2024-01-20T10:00:00Z",
  "updatedAt": "2024-01-20T11:00:00Z"
}
```

**Error Cases**:
- 400: Invalid input
- 401: Unauthorized
- 403: Insufficient permissions
- 404: Board not found

---

### 3.4. Delete Board
**DELETE** `/boards/{boardId}`

**Description**: Delete board permanently. Only Owner can delete.

**Auth**: Require JWT (Owner only)

**Path Params**:
- `boardId` (required): Board ID

**Response** (204): No content

**Error Cases**:
- 401: Unauthorized
- 403: Only owner can delete
- 404: Board not found

---

### 3.5. List User's Boards
**GET** `/boards`

**Description**: Get all boards where user is a member.

**Auth**: Require JWT

**Query Params**:
- `limit` (optional, default: 50): Max results
- `offset` (optional, default: 0): Pagination offset
- `sortBy` (optional, default: "updatedAt"): Sort field (updatedAt, createdAt, name)
- `order` (optional, default: "desc"): Sort order (asc, desc)

**Response** (200):
```json
{
  "boards": [
    {
      "id": "board_123",
      "name": "Project Alpha",
      "description": "Main project board",
      "background": {
        "type": "color",
        "value": "#0079bf"
      },
      "ownerId": "user_123",
      "userRole": "owner",
      "memberCount": 5,
      "listCount": 3,
      "updatedAt": "2024-01-20T10:00:00Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

**Error Cases**:
- 401: Unauthorized

---

## 4. BOARD MEMBERS MODULE

### 4.1. Add Member to Board
**POST** `/boards/{boardId}/members`

**Description**: Add a user as member to board. Requires Owner or Leader role.

**Auth**: Require JWT (Owner/Leader)

**Path Params**:
- `boardId` (required): Board ID

**Request Body**:
```json
{
  "userId": "user_456",
  "role": "member"
}
```

**Response** (201):
```json
{
  "id": "member_123",
  "boardId": "board_123",
  "userId": "user_456",
  "role": "member",
  "user": {
    "id": "user_456",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "avatarUrl": "https://lh3.googleusercontent.com/..."
  },
  "joinedAt": "2024-01-20T12:00:00Z"
}
```

**Error Cases**:
- 400: Invalid role or user already member
- 401: Unauthorized
- 403: Insufficient permissions
- 404: Board or user not found

---

### 4.2. Update Member Role
**PATCH** `/boards/{boardId}/members/{memberId}`

**Description**: Change member role. Owner can change any role. Leader can change member to leader (but not owner).

**Auth**: Require JWT (Owner/Leader)

**Path Params**:
- `boardId` (required): Board ID
- `memberId` (required): Member ID

**Request Body**:
```json
{
  "role": "leader"
}
```

**Response** (200):
```json
{
  "id": "member_123",
  "boardId": "board_123",
  "userId": "user_456",
  "role": "leader",
  "user": {
    "id": "user_456",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "avatarUrl": "https://lh3.googleusercontent.com/..."
  },
  "joinedAt": "2024-01-20T12:00:00Z"
}
```

**Error Cases**:
- 400: Invalid role or cannot change owner
- 401: Unauthorized
- 403: Insufficient permissions
- 404: Member not found

---

### 4.3. Remove Member from Board
**DELETE** `/boards/{boardId}/members/{memberId}`

**Description**: Remove member from board. Owner cannot be removed. Owner/Leader can remove others.

**Auth**: Require JWT (Owner/Leader)

**Path Params**:
- `boardId` (required): Board ID
- `memberId` (required): Member ID

**Response** (204): No content

**Error Cases**:
- 400: Cannot remove owner
- 401: Unauthorized
- 403: Insufficient permissions
- 404: Member not found

---

### 4.4. List Board Members
**GET** `/boards/{boardId}/members`

**Description**: Get all members of a board.

**Auth**: Require JWT (must be member)

**Path Params**:
- `boardId` (required): Board ID

**Response** (200):
```json
{
  "members": [
    {
      "id": "member_123",
      "boardId": "board_123",
      "userId": "user_123",
      "role": "owner",
      "user": {
        "id": "user_123",
        "name": "John Doe",
        "email": "john@example.com",
        "avatarUrl": "https://lh3.googleusercontent.com/..."
      },
      "joinedAt": "2024-01-20T10:00:00Z"
    }
  ],
  "total": 5
}
```

**Error Cases**:
- 401: Unauthorized
- 403: Not a board member
- 404: Board not found

---

## 5. LISTS MODULE

### 5.1. Create List
**POST** `/boards/{boardId}/lists`

**Description**: Create a new list in board. Requires Member role.

**Auth**: Require JWT (Member)

**Path Params**:
- `boardId` (required): Board ID

**Request Body**:
```json
{
  "name": "To Do",
  "position": 0
}
```

**Response** (201):
```json
{
  "id": "list_123",
  "boardId": "board_123",
  "name": "To Do",
  "position": 0,
  "cardCount": 0,
  "createdAt": "2024-01-20T10:00:00Z",
  "updatedAt": "2024-01-20T10:00:00Z"
}
```

**Error Cases**:
- 400: Invalid input
- 401: Unauthorized
- 403: Not a board member
- 404: Board not found

---

### 5.2. Get List by ID
**GET** `/lists/{listId}`

**Description**: Get list details with card count.

**Auth**: Require JWT (must be board member)

**Path Params**:
- `listId` (required): List ID

**Response** (200):
```json
{
  "id": "list_123",
  "boardId": "board_123",
  "name": "To Do",
  "position": 0,
  "cardCount": 5,
  "createdAt": "2024-01-20T10:00:00Z",
  "updatedAt": "2024-01-20T10:00:00Z"
}
```

**Error Cases**:
- 401: Unauthorized
- 403: Not a board member
- 404: List not found

---

### 5.3. Update List
**PATCH** `/lists/{listId}`

**Description**: Update list name or position. Requires Member role.

**Auth**: Require JWT (Member)

**Path Params**:
- `listId` (required): List ID

**Request Body**:
```json
{
  "name": "In Progress",
  "position": 1
}
```

**Response** (200):
```json
{
  "id": "list_123",
  "boardId": "board_123",
  "name": "In Progress",
  "position": 1,
  "cardCount": 5,
  "createdAt": "2024-01-20T10:00:00Z",
  "updatedAt": "2024-01-20T11:00:00Z"
}
```

**Error Cases**:
- 400: Invalid input
- 401: Unauthorized
- 403: Not a board member
- 404: List not found

---

### 5.4. Delete List
**DELETE** `/lists/{listId}`

**Description**: Delete list and all its cards. Requires Member role.

**Auth**: Require JWT (Member)

**Path Params**:
- `listId` (required): List ID

**Response** (204): No content

**Error Cases**:
- 401: Unauthorized
- 403: Not a board member
- 404: List not found

---

### 5.5. List Board Lists
**GET** `/boards/{boardId}/lists`

**Description**: Get all lists in board, ordered by position.

**Auth**: Require JWT (must be board member)

**Path Params**:
- `boardId` (required): Board ID

**Query Params**:
- `includeCards` (optional, default: false): Include cards in response

**Response** (200):
```json
{
  "lists": [
    {
      "id": "list_123",
      "boardId": "board_123",
      "name": "To Do",
      "position": 0,
      "cardCount": 5,
      "createdAt": "2024-01-20T10:00:00Z",
      "updatedAt": "2024-01-20T10:00:00Z"
    }
  ],
  "total": 3
}
```

**Error Cases**:
- 401: Unauthorized
- 403: Not a board member
- 404: Board not found

---

### 5.6. Reorder Lists
**PATCH** `/boards/{boardId}/lists/reorder`

**Description**: Reorder multiple lists at once (drag & drop).

**Auth**: Require JWT (Member)

**Path Params**:
- `boardId` (required): Board ID

**Request Body**:
```json
{
  "listIds": ["list_123", "list_456", "list_789"]
}
```

**Response** (200):
```json
{
  "message": "Lists reordered successfully"
}
```

**Error Cases**:
- 400: Invalid list IDs or not all lists belong to board
- 401: Unauthorized
- 403: Not a board member
- 404: Board not found

---

## 6. CARDS MODULE

### 6.1. Create Card
**POST** `/lists/{listId}/cards`

**Description**: Create a new card in list. Requires Member role.

**Auth**: Require JWT (Member)

**Path Params**:
- `listId` (required): List ID

**Request Body**:
```json
{
  "title": "Implement login feature",
  "description": "Add Google OAuth login",
  "position": 0,
  "dueDate": "2024-02-01",
  "assigneeId": "user_456",
  "priority": "high",
  "labelIds": ["label_123", "label_456"]
}
```

**Response** (201):
```json
{
  "id": "card_123",
  "listId": "list_123",
  "boardId": "board_123",
  "title": "Implement login feature",
  "description": "Add Google OAuth login",
  "position": 0,
  "status": "todo",
  "dueDate": "2024-02-01",
  "assignee": {
    "id": "user_456",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "avatarUrl": "https://lh3.googleusercontent.com/..."
  },
  "priority": "high",
  "labels": [
    {
      "id": "label_123",
      "name": "urgent",
      "color": "#ff0000"
    }
  ],
  "checklistProgress": {
    "total": 0,
    "completed": 0,
    "percentage": 0
  },
  "createdAt": "2024-01-20T10:00:00Z",
  "updatedAt": "2024-01-20T10:00:00Z"
}
```

**Error Cases**:
- 400: Invalid input
- 401: Unauthorized
- 403: Not a board member
- 404: List not found

---

### 6.2. Get Card by ID
**GET** `/cards/{cardId}`

**Description**: Get full card details including checklist, comments, attachments.

**Auth**: Require JWT (must be board member)

**Path Params**:
- `cardId` (required): Card ID

**Query Params**:
- `includeChecklist` (optional, default: true): Include checklist items
- `includeComments` (optional, default: true): Include comments
- `includeAttachments` (optional, default: true): Include attachments
- `includeActivity` (optional, default: false): Include activity log

**Response** (200):
```json
{
  "id": "card_123",
  "listId": "list_123",
  "boardId": "board_123",
  "title": "Implement login feature",
  "description": "Add Google OAuth login",
  "position": 0,
  "status": "todo",
  "dueDate": "2024-02-01",
  "assignee": {
    "id": "user_456",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "avatarUrl": "https://lh3.googleusercontent.com/..."
  },
  "priority": "high",
  "labels": [
    {
      "id": "label_123",
      "name": "urgent",
      "color": "#ff0000"
    }
  ],
  "checklistProgress": {
    "total": 5,
    "completed": 2,
    "percentage": 40
  },
  "commentCount": 3,
  "attachmentCount": 1,
  "createdAt": "2024-01-20T10:00:00Z",
  "updatedAt": "2024-01-20T10:00:00Z"
}
```

**Error Cases**:
- 401: Unauthorized
- 403: Not a board member
- 404: Card not found

---

### 6.3. Update Card
**PATCH** `/cards/{cardId}`

**Description**: Update card fields. Requires Member role.

**Auth**: Require JWT (Member)

**Path Params**:
- `cardId` (required): Card ID

**Request Body**:
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "dueDate": "2024-02-15",
  "assigneeId": "user_789",
  "priority": "medium",
  "position": 1
}
```

**Response** (200):
```json
{
  "id": "card_123",
  "listId": "list_123",
  "boardId": "board_123",
  "title": "Updated title",
  "description": "Updated description",
  "position": 1,
  "status": "todo",
  "dueDate": "2024-02-15",
  "assignee": {
    "id": "user_789",
    "name": "Bob Wilson",
    "email": "bob@example.com",
    "avatarUrl": "https://lh3.googleusercontent.com/..."
  },
  "priority": "medium",
  "labels": [],
  "checklistProgress": {
    "total": 5,
    "completed": 2,
    "percentage": 40
  },
  "createdAt": "2024-01-20T10:00:00Z",
  "updatedAt": "2024-01-20T12:00:00Z"
}
```

**Error Cases**:
- 400: Invalid input
- 401: Unauthorized
- 403: Not a board member
- 404: Card not found

---

### 6.4. Delete Card
**DELETE** `/cards/{cardId}`

**Description**: Delete card permanently. Requires Member role.

**Auth**: Require JWT (Member)

**Path Params**:
- `cardId` (required): Card ID

**Response** (204): No content

**Error Cases**:
- 401: Unauthorized
- 403: Not a board member
- 404: Card not found

---

### 6.5. Move Card
**PATCH** `/cards/{cardId}/move`

**Description**: Move card to different list or position (drag & drop).

**Auth**: Require JWT (Member)

**Path Params**:
- `cardId` (required): Card ID

**Request Body**:
```json
{
  "listId": "list_456",
  "position": 2
}
```

**Response** (200):
```json
{
  "id": "card_123",
  "listId": "list_456",
  "boardId": "board_123",
  "title": "Implement login feature",
  "position": 2,
  "status": "todo",
  "createdAt": "2024-01-20T10:00:00Z",
  "updatedAt": "2024-01-20T13:00:00Z"
}
```

**Error Cases**:
- 400: Invalid list ID or position
- 401: Unauthorized
- 403: Not a board member
- 404: Card or list not found

---

### 6.6. Update Card Status
**PATCH** `/cards/{cardId}/status`

**Description**: Update card status workflow. Member can set to Todo/InProgress/Done. Leader can approve/reject.

**Auth**: Require JWT (Member for Todo/InProgress/Done, Leader for Approve/Reject)

**Path Params**:
- `cardId` (required): Card ID

**Request Body**:
```json
{
  "status": "waitingForApproval"
}
```

**Response** (200):
```json
{
  "id": "card_123",
  "status": "waitingForApproval",
  "updatedAt": "2024-01-20T14:00:00Z"
}
```

**Error Cases**:
- 400: Invalid status transition
- 401: Unauthorized
- 403: Insufficient permissions for status change
- 404: Card not found

---

### 6.7. Approve Card
**POST** `/cards/{cardId}/approve`

**Description**: Leader approves card, sets status to Done.

**Auth**: Require JWT (Leader only)

**Path Params**:
- `cardId` (required): Card ID

**Request Body**:
```json
{
  "comment": "Great work!"
}
```

**Response** (200):
```json
{
  "id": "card_123",
  "status": "done",
  "updatedAt": "2024-01-20T15:00:00Z"
}
```

**Error Cases**:
- 400: Card not in waitingForApproval status
- 401: Unauthorized
- 403: Not a leader
- 404: Card not found

---

### 6.8. Reject Card
**POST** `/cards/{cardId}/reject`

**Description**: Leader rejects card, sets status to Rejected, auto-creates comment.

**Auth**: Require JWT (Leader only)

**Path Params**:
- `cardId` (required): Card ID

**Request Body**:
```json
{
  "reason": "Needs more testing"
}
```

**Response** (200):
```json
{
  "id": "card_123",
  "status": "rejected",
  "updatedAt": "2024-01-20T15:00:00Z",
  "comment": {
    "id": "comment_123",
    "content": "Rejected: Needs more testing",
    "authorId": "user_123",
    "createdAt": "2024-01-20T15:00:00Z"
  }
}
```

**Error Cases**:
- 400: Card not in waitingForApproval status
- 401: Unauthorized
- 403: Not a leader
- 404: Card not found

---

### 6.9. List Cards in List
**GET** `/lists/{listId}/cards`

**Description**: Get all cards in a list, ordered by position.

**Auth**: Require JWT (must be board member)

**Path Params**:
- `listId` (required): List ID

**Query Params**:
- `status` (optional): Filter by status
- `assigneeId` (optional): Filter by assignee
- `labelId` (optional): Filter by label
- `dueDate` (optional): Filter by due date (today, week, overdue)

**Response** (200):
```json
{
  "cards": [
    {
      "id": "card_123",
      "listId": "list_123",
      "boardId": "board_123",
      "title": "Implement login feature",
      "description": "Add Google OAuth login",
      "position": 0,
      "status": "todo",
      "dueDate": "2024-02-01",
      "assignee": {
        "id": "user_456",
        "name": "Jane Smith",
        "avatarUrl": "https://lh3.googleusercontent.com/..."
      },
      "priority": "high",
      "labels": [],
      "checklistProgress": {
        "total": 5,
        "completed": 2,
        "percentage": 40
      },
      "createdAt": "2024-01-20T10:00:00Z",
      "updatedAt": "2024-01-20T10:00:00Z"
    }
  ],
  "total": 10
}
```

**Error Cases**:
- 401: Unauthorized
- 403: Not a board member
- 404: List not found

---

### 6.10. Search Cards
**GET** `/boards/{boardId}/cards/search`

**Description**: Search cards by title or description within a board.

**Auth**: Require JWT (must be board member)

**Path Params**:
- `boardId` (required): Board ID

**Query Params**:
- `q` (required): Search query
- `status` (optional): Filter by status
- `assigneeId` (optional): Filter by assignee
- `labelId` (optional): Filter by label
- `dueDate` (optional): Filter by due date
- `limit` (optional, default: 20): Max results
- `offset` (optional, default: 0): Pagination offset

**Response** (200):
```json
{
  "cards": [
    {
      "id": "card_123",
      "listId": "list_123",
      "boardId": "board_123",
      "title": "Implement login feature",
      "description": "Add Google OAuth login",
      "status": "todo",
      "dueDate": "2024-02-01",
      "assignee": {
        "id": "user_456",
        "name": "Jane Smith"
      },
      "priority": "high",
      "labels": []
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

**Error Cases**:
- 400: Missing query parameter
- 401: Unauthorized
- 403: Not a board member
- 404: Board not found

---

## 7. CHECKLISTS MODULE

### 7.1. Create Checklist Item
**POST** `/cards/{cardId}/checklist`

**Description**: Add a checklist item to card.

**Auth**: Require JWT (Member)

**Path Params**:
- `cardId` (required): Card ID

**Request Body**:
```json
{
  "title": "Write unit tests",
  "position": 0
}
```

**Response** (201):
```json
{
  "id": "checklist_123",
  "cardId": "card_123",
  "title": "Write unit tests",
  "isCompleted": false,
  "position": 0,
  "createdAt": "2024-01-20T10:00:00Z",
  "updatedAt": "2024-01-20T10:00:00Z"
}
```

**Error Cases**:
- 400: Invalid input
- 401: Unauthorized
- 403: Not a board member
- 404: Card not found

---

### 7.2. Update Checklist Item
**PATCH** `/checklist/{checklistId}`

**Description**: Update checklist item title or position.

**Auth**: Require JWT (Member)

**Path Params**:
- `checklistId` (required): Checklist item ID

**Request Body**:
```json
{
  "title": "Write integration tests",
  "position": 1
}
```

**Response** (200):
```json
{
  "id": "checklist_123",
  "cardId": "card_123",
  "title": "Write integration tests",
  "isCompleted": false,
  "position": 1,
  "createdAt": "2024-01-20T10:00:00Z",
  "updatedAt": "2024-01-20T11:00:00Z"
}
```

**Error Cases**:
- 400: Invalid input
- 401: Unauthorized
- 403: Not a board member
- 404: Checklist item not found

---

### 7.3. Toggle Checklist Item
**PATCH** `/checklist/{checklistId}/toggle`

**Description**: Toggle checklist item completion status.

**Auth**: Require JWT (Member)

**Path Params**:
- `checklistId` (required): Checklist item ID

**Response** (200):
```json
{
  "id": "checklist_123",
  "cardId": "card_123",
  "title": "Write unit tests",
  "isCompleted": true,
  "position": 0,
  "createdAt": "2024-01-20T10:00:00Z",
  "updatedAt": "2024-01-20T12:00:00Z"
}
```

**Error Cases**:
- 401: Unauthorized
- 403: Not a board member
- 404: Checklist item not found

---

### 7.4. Delete Checklist Item
**DELETE** `/checklist/{checklistId}`

**Description**: Delete checklist item.

**Auth**: Require JWT (Member)

**Path Params**:
- `checklistId` (required): Checklist item ID

**Response** (204): No content

**Error Cases**:
- 401: Unauthorized
- 403: Not a board member
- 404: Checklist item not found

---

### 7.5. List Card Checklist Items
**GET** `/cards/{cardId}/checklist`

**Description**: Get all checklist items for a card, ordered by position.

**Auth**: Require JWT (must be board member)

**Path Params**:
- `cardId` (required): Card ID

**Response** (200):
```json
{
  "items": [
    {
      "id": "checklist_123",
      "cardId": "card_123",
      "title": "Write unit tests",
      "isCompleted": true,
      "position": 0,
      "createdAt": "2024-01-20T10:00:00Z",
      "updatedAt": "2024-01-20T12:00:00Z"
    }
  ],
  "total": 5,
  "completed": 2,
  "percentage": 40
}
```

**Error Cases**:
- 401: Unauthorized
- 403: Not a board member
- 404: Card not found

---

## 8. LABELS MODULE

### 8.1. Create Label
**POST** `/boards/{boardId}/labels`

**Description**: Create a label at board level. Requires Member role.

**Auth**: Require JWT (Member)

**Path Params**:
- `boardId` (required): Board ID

**Request Body**:
```json
{
  "name": "urgent",
  "color": "#ff0000"
}
```

**Response** (201):
```json
{
  "id": "label_123",
  "boardId": "board_123",
  "name": "urgent",
  "color": "#ff0000",
  "createdAt": "2024-01-20T10:00:00Z"
}
```

**Error Cases**:
- 400: Invalid color format or duplicate name
- 401: Unauthorized
- 403: Not a board member
- 404: Board not found

---

### 8.2. Update Label
**PATCH** `/labels/{labelId}`

**Description**: Update label name or color.

**Auth**: Require JWT (Member)

**Path Params**:
- `labelId` (required): Label ID

**Request Body**:
```json
{
  "name": "critical",
  "color": "#cc0000"
}
```

**Response** (200):
```json
{
  "id": "label_123",
  "boardId": "board_123",
  "name": "critical",
  "color": "#cc0000",
  "createdAt": "2024-01-20T10:00:00Z",
  "updatedAt": "2024-01-20T11:00:00Z"
}
```

**Error Cases**:
- 400: Invalid input
- 401: Unauthorized
- 403: Not a board member
- 404: Label not found

---

### 8.3. Delete Label
**DELETE** `/labels/{labelId}`

**Description**: Delete label. Removes from all cards.

**Auth**: Require JWT (Member)

**Path Params**:
- `labelId` (required): Label ID

**Response** (204): No content

**Error Cases**:
- 401: Unauthorized
- 403: Not a board member
- 404: Label not found

---

### 8.4. List Board Labels
**GET** `/boards/{boardId}/labels`

**Description**: Get all labels in a board.

**Auth**: Require JWT (must be board member)

**Path Params**:
- `boardId` (required): Board ID

**Response** (200):
```json
{
  "labels": [
    {
      "id": "label_123",
      "boardId": "board_123",
      "name": "urgent",
      "color": "#ff0000",
      "createdAt": "2024-01-20T10:00:00Z"
    }
  ],
  "total": 10
}
```

**Error Cases**:
- 401: Unauthorized
- 403: Not a board member
- 404: Board not found

---

### 8.5. Add Label to Card
**POST** `/cards/{cardId}/labels/{labelId}`

**Description**: Attach label to card.

**Auth**: Require JWT (Member)

**Path Params**:
- `cardId` (required): Card ID
- `labelId` (required): Label ID

**Response** (200):
```json
{
  "message": "Label added to card",
  "card": {
    "id": "card_123",
    "labels": [
      {
        "id": "label_123",
        "name": "urgent",
        "color": "#ff0000"
      }
    ]
  }
}
```

**Error Cases**:
- 400: Label already attached
- 401: Unauthorized
- 403: Not a board member
- 404: Card or label not found

---

### 8.6. Remove Label from Card
**DELETE** `/cards/{cardId}/labels/{labelId}`

**Description**: Remove label from card.

**Auth**: Require JWT (Member)

**Path Params**:
- `cardId` (required): Card ID
- `labelId` (required): Label ID

**Response** (204): No content

**Error Cases**:
- 401: Unauthorized
- 403: Not a board member
- 404: Card or label not found

---

## 9. COMMENTS MODULE

### 9.1. Create Comment
**POST** `/cards/{cardId}/comments`

**Description**: Add a comment to card. Supports @mentions.

**Auth**: Require JWT (Member)

**Path Params**:
- `cardId` (required): Card ID

**Request Body**:
```json
{
  "content": "Great progress! @user_456 please review this.",
  "mentions": ["user_456"]
}
```

**Response** (201):
```json
{
  "id": "comment_123",
  "cardId": "card_123",
  "content": "Great progress! @user_456 please review this.",
  "author": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "avatarUrl": "https://lh3.googleusercontent.com/..."
  },
  "mentions": [
    {
      "id": "user_456",
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  ],
  "createdAt": "2024-01-20T10:00:00Z",
  "updatedAt": "2024-01-20T10:00:00Z"
}
```

**Error Cases**:
- 400: Invalid input or empty content
- 401: Unauthorized
- 403: Not a board member
- 404: Card not found

---

### 9.2. Update Comment
**PATCH** `/comments/{commentId}`

**Description**: Update comment content. Only author can update.

**Auth**: Require JWT (Author only)

**Path Params**:
- `commentId` (required): Comment ID

**Request Body**:
```json
{
  "content": "Updated comment content"
}
```

**Response** (200):
```json
{
  "id": "comment_123",
  "cardId": "card_123",
  "content": "Updated comment content",
  "author": {
    "id": "user_123",
    "name": "John Doe",
    "avatarUrl": "https://lh3.googleusercontent.com/..."
  },
  "mentions": [],
  "createdAt": "2024-01-20T10:00:00Z",
  "updatedAt": "2024-01-20T11:00:00Z"
}
```

**Error Cases**:
- 400: Invalid input
- 401: Unauthorized
- 403: Not the author
- 404: Comment not found

---

### 9.3. Delete Comment
**DELETE** `/comments/{commentId}`

**Description**: Delete comment. Only author can delete.

**Auth**: Require JWT (Author only)

**Path Params**:
- `commentId` (required): Comment ID

**Response** (204): No content

**Error Cases**:
- 401: Unauthorized
- 403: Not the author
- 404: Comment not found

---

### 9.4. List Card Comments
**GET** `/cards/{cardId}/comments`

**Description**: Get all comments for a card, ordered by creation time.

**Auth**: Require JWT (must be board member)

**Path Params**:
- `cardId` (required): Card ID

**Query Params**:
- `limit` (optional, default: 50): Max results
- `offset` (optional, default: 0): Pagination offset

**Response** (200):
```json
{
  "comments": [
    {
      "id": "comment_123",
      "cardId": "card_123",
      "content": "Great progress!",
      "author": {
        "id": "user_123",
        "name": "John Doe",
        "avatarUrl": "https://lh3.googleusercontent.com/..."
      },
      "mentions": [],
      "createdAt": "2024-01-20T10:00:00Z",
      "updatedAt": "2024-01-20T10:00:00Z"
    }
  ],
  "total": 5,
  "limit": 50,
  "offset": 0
}
```

**Error Cases**:
- 401: Unauthorized
- 403: Not a board member
- 404: Card not found

---

## 10. ATTACHMENTS MODULE

### 10.1. Upload Attachment
**POST** `/cards/{cardId}/attachments`

**Description**: Upload file attachment to card. Supports images, PDFs, etc.

**Auth**: Require JWT (Member)

**Path Params**:
- `cardId` (required): Card ID

**Request Body**: Multipart form data
- `file` (required): File to upload
- `name` (optional): Custom file name

**Response** (201):
```json
{
  "id": "attachment_123",
  "cardId": "card_123",
  "name": "document.pdf",
  "url": "https://storage.taskmanager.com/attachments/...",
  "mimeType": "application/pdf",
  "size": 1024000,
  "uploadedBy": {
    "id": "user_123",
    "name": "John Doe",
    "avatarUrl": "https://lh3.googleusercontent.com/..."
  },
  "createdAt": "2024-01-20T10:00:00Z"
}
```

**Error Cases**:
- 400: Invalid file or file too large
- 401: Unauthorized
- 403: Not a board member
- 404: Card not found
- 413: File size exceeds limit

---

### 10.2. Get Attachment
**GET** `/attachments/{attachmentId}`

**Description**: Get attachment metadata.

**Auth**: Require JWT (must be board member)

**Path Params**:
- `attachmentId` (required): Attachment ID

**Response** (200):
```json
{
  "id": "attachment_123",
  "cardId": "card_123",
  "name": "document.pdf",
  "url": "https://storage.taskmanager.com/attachments/...",
  "mimeType": "application/pdf",
  "size": 1024000,
  "uploadedBy": {
    "id": "user_123",
    "name": "John Doe",
    "avatarUrl": "https://lh3.googleusercontent.com/..."
  },
  "createdAt": "2024-01-20T10:00:00Z"
}
```

**Error Cases**:
- 401: Unauthorized
- 403: Not a board member
- 404: Attachment not found

---

### 10.3. Delete Attachment
**DELETE** `/attachments/{attachmentId}`

**Description**: Delete attachment. Only uploader or card assignee can delete.

**Auth**: Require JWT (Uploader or Assignee)

**Path Params**:
- `attachmentId` (required): Attachment ID

**Response** (204): No content

**Error Cases**:
- 401: Unauthorized
- 403: Insufficient permissions
- 404: Attachment not found

---

### 10.4. List Card Attachments
**GET** `/cards/{cardId}/attachments`

**Description**: Get all attachments for a card.

**Auth**: Require JWT (must be board member)

**Path Params**:
- `cardId` (required): Card ID

**Response** (200):
```json
{
  "attachments": [
    {
      "id": "attachment_123",
      "cardId": "card_123",
      "name": "document.pdf",
      "url": "https://storage.taskmanager.com/attachments/...",
      "mimeType": "application/pdf",
      "size": 1024000,
      "uploadedBy": {
        "id": "user_123",
        "name": "John Doe",
        "avatarUrl": "https://lh3.googleusercontent.com/..."
      },
      "createdAt": "2024-01-20T10:00:00Z"
    }
  ],
  "total": 3
}
```

**Error Cases**:
- 401: Unauthorized
- 403: Not a board member
- 404: Card not found

---

## 11. EXCEL IMPORT MODULE

### 11.1. Import Excel File
**POST** `/boards/{boardId}/import/excel`

**Description**: Import cards from Excel file (1-sheet format). Creates lists, cards, checklist items based on Excel data.

**Auth**: Require JWT (Member)

**Path Params**:
- `boardId` (required): Board ID

**Request Body**: Multipart form data
- `file` (required): Excel file (.xlsx, .xls)
- `options` (optional, JSON string): Import options
  ```json
  {
    "createMissingLists": true,
    "createMissingLabels": true,
    "skipDuplicates": false
  }
  ```

**Response** (200):
```json
{
  "importId": "import_123",
  "boardId": "board_123",
  "summary": {
    "listsCreated": 3,
    "cardsCreated": 15,
    "checklistItemsCreated": 45,
    "labelsCreated": 5,
    "errors": []
  },
  "createdAt": "2024-01-20T10:00:00Z"
}
```

**Error Cases**:
- 400: Invalid file format or structure
- 401: Unauthorized
- 403: Not a board member
- 404: Board not found
- 422: Excel validation errors (detailed in response)

**Error Response Example** (422):
```json
{
  "error": "Validation failed",
  "details": [
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
```

---

### 11.2. Get Import Status
**GET** `/boards/{boardId}/import/{importId}`

**Description**: Get status of an import operation.

**Auth**: Require JWT (must be board member)

**Path Params**:
- `boardId` (required): Board ID
- `importId` (required): Import ID

**Response** (200):
```json
{
  "importId": "import_123",
  "boardId": "board_123",
  "status": "completed",
  "summary": {
    "listsCreated": 3,
    "cardsCreated": 15,
    "checklistItemsCreated": 45,
    "labelsCreated": 5,
    "errors": []
  },
  "createdAt": "2024-01-20T10:00:00Z",
  "completedAt": "2024-01-20T10:05:00Z"
}
```

**Error Cases**:
- 401: Unauthorized
- 403: Not a board member
- 404: Import not found

---

### 11.3. Download Excel Template
**GET** `/boards/{boardId}/import/template`

**Description**: Download Excel template file for import.

**Auth**: Require JWT (must be board member)

**Path Params**:
- `boardId` (required): Board ID

**Response** (200): Excel file download

**Error Cases**:
- 401: Unauthorized
- 403: Not a board member
- 404: Board not found

---

## 12. NOTIFICATIONS MODULE

### 12.1. Get User Notifications
**GET** `/notifications`

**Description**: Get current user's notifications.

**Auth**: Require JWT

**Query Params**:
- `unreadOnly` (optional, default: false): Only unread notifications
- `limit` (optional, default: 20): Max results
- `offset` (optional, default: 0): Pagination offset
- `type` (optional): Filter by type (card_completed, card_approved, card_rejected, deadline_upcoming, deadline_overdue)

**Response** (200):
```json
{
  "notifications": [
    {
      "id": "notif_123",
      "type": "card_completed",
      "title": "Card marked as complete",
      "message": "Jane Smith marked 'Implement login feature' as complete",
      "cardId": "card_123",
      "boardId": "board_123",
      "isRead": false,
      "channels": ["email", "telegram"],
      "createdAt": "2024-01-20T10:00:00Z"
    }
  ],
  "total": 15,
  "unreadCount": 5,
  "limit": 20,
  "offset": 0
}
```

**Error Cases**:
- 401: Unauthorized

---

### 12.2. Mark Notification as Read
**PATCH** `/notifications/{notificationId}/read`

**Description**: Mark notification as read.

**Auth**: Require JWT

**Path Params**:
- `notificationId` (required): Notification ID

**Response** (200):
```json
{
  "id": "notif_123",
  "isRead": true,
  "readAt": "2024-01-20T11:00:00Z"
}
```

**Error Cases**:
- 401: Unauthorized
- 404: Notification not found

---

### 12.3. Mark All Notifications as Read
**POST** `/notifications/read-all`

**Description**: Mark all user's notifications as read.

**Auth**: Require JWT

**Response** (200):
```json
{
  "message": "All notifications marked as read",
  "count": 5
}
```

**Error Cases**:
- 401: Unauthorized

---

### 12.4. Delete Notification
**DELETE** `/notifications/{notificationId}`

**Description**: Delete notification.

**Auth**: Require JWT

**Path Params**:
- `notificationId` (required): Notification ID

**Response** (204): No content

**Error Cases**:
- 401: Unauthorized
- 404: Notification not found

---

## 13. ACTIVITY LOG MODULE

### 13.1. Get Board Activity Log
**GET** `/boards/{boardId}/activity`

**Description**: Get activity log for a board.

**Auth**: Require JWT (must be board member)

**Path Params**:
- `boardId` (required): Board ID

**Query Params**:
- `type` (optional): Filter by activity type (create_card, move_card, change_assignee, change_deadline, approve, reject, comment, attachment, import_excel, automation)
- `userId` (optional): Filter by user
- `cardId` (optional): Filter by card
- `limit` (optional, default: 50): Max results
- `offset` (optional, default: 0): Pagination offset

**Response** (200):
```json
{
  "activities": [
    {
      "id": "activity_123",
      "boardId": "board_123",
      "cardId": "card_123",
      "type": "create_card",
      "description": "John Doe created card 'Implement login feature'",
      "user": {
        "id": "user_123",
        "name": "John Doe",
        "avatarUrl": "https://lh3.googleusercontent.com/..."
      },
      "metadata": {
        "cardTitle": "Implement login feature",
        "listName": "To Do"
      },
      "createdAt": "2024-01-20T10:00:00Z"
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

**Error Cases**:
- 401: Unauthorized
- 403: Not a board member
- 404: Board not found

---

### 13.2. Get Card Activity Log
**GET** `/cards/{cardId}/activity`

**Description**: Get activity log for a specific card.

**Auth**: Require JWT (must be board member)

**Path Params**:
- `cardId` (required): Card ID

**Query Params**:
- `limit` (optional, default: 50): Max results
- `offset` (optional, default: 0): Pagination offset

**Response** (200):
```json
{
  "activities": [
    {
      "id": "activity_123",
      "boardId": "board_123",
      "cardId": "card_123",
      "type": "change_assignee",
      "description": "John Doe assigned card to Jane Smith",
      "user": {
        "id": "user_123",
        "name": "John Doe",
        "avatarUrl": "https://lh3.googleusercontent.com/..."
      },
      "metadata": {
        "oldAssignee": null,
        "newAssignee": "Jane Smith"
      },
      "createdAt": "2024-01-20T10:00:00Z"
    }
  ],
  "total": 25,
  "limit": 50,
  "offset": 0
}
```

**Error Cases**:
- 401: Unauthorized
- 403: Not a board member
- 404: Card not found

---

## 14. AUTOMATION RULES MODULE

### 14.1. Create Automation Rule
**POST** `/boards/{boardId}/automation`

**Description**: Create an automation rule (IF-THEN).

**Auth**: Require JWT (Owner/Leader)

**Path Params**:
- `boardId` (required): Board ID

**Request Body**:
```json
{
  "name": "Auto-approve high priority done cards",
  "enabled": true,
  "trigger": {
    "type": "card_moved_to_done",
    "conditions": {
      "priority": "high"
    }
  },
  "actions": [
    {
      "type": "set_status",
      "value": "done"
    },
    {
      "type": "notify",
      "recipients": ["assignee", "leader"],
      "message": "Card automatically approved"
    }
  ]
}
```

**Response** (201):
```json
{
  "id": "automation_123",
  "boardId": "board_123",
  "name": "Auto-approve high priority done cards",
  "enabled": true,
  "trigger": {
    "type": "card_moved_to_done",
    "conditions": {
      "priority": "high"
    }
  },
  "actions": [
    {
      "type": "set_status",
      "value": "done"
    },
    {
      "type": "notify",
      "recipients": ["assignee", "leader"],
      "message": "Card automatically approved"
    }
  ],
  "executionCount": 0,
  "createdAt": "2024-01-20T10:00:00Z",
  "updatedAt": "2024-01-20T10:00:00Z"
}
```

**Error Cases**:
- 400: Invalid trigger or action configuration
- 401: Unauthorized
- 403: Not Owner/Leader
- 404: Board not found

---

### 14.2. Get Automation Rule
**GET** `/automation/{automationId}`

**Description**: Get automation rule details.

**Auth**: Require JWT (must be board member)

**Path Params**:
- `automationId` (required): Automation rule ID

**Response** (200):
```json
{
  "id": "automation_123",
  "boardId": "board_123",
  "name": "Auto-approve high priority done cards",
  "enabled": true,
  "trigger": {
    "type": "card_moved_to_done",
    "conditions": {
      "priority": "high"
    }
  },
  "actions": [
    {
      "type": "set_status",
      "value": "done"
    }
  ],
  "executionCount": 5,
  "createdAt": "2024-01-20T10:00:00Z",
  "updatedAt": "2024-01-20T10:00:00Z"
}
```

**Error Cases**:
- 401: Unauthorized
- 403: Not a board member
- 404: Automation rule not found

---

### 14.3. Update Automation Rule
**PATCH** `/automation/{automationId}`

**Description**: Update automation rule. Requires Owner/Leader.

**Auth**: Require JWT (Owner/Leader)

**Path Params**:
- `automationId` (required): Automation rule ID

**Request Body**:
```json
{
  "name": "Updated rule name",
  "enabled": false,
  "trigger": {
    "type": "deadline_upcoming",
    "conditions": {
      "hoursBefore": 24
    }
  }
}
```

**Response** (200):
```json
{
  "id": "automation_123",
  "boardId": "board_123",
  "name": "Updated rule name",
  "enabled": false,
  "trigger": {
    "type": "deadline_upcoming",
    "conditions": {
      "hoursBefore": 24
    }
  },
  "actions": [],
  "executionCount": 5,
  "createdAt": "2024-01-20T10:00:00Z",
  "updatedAt": "2024-01-20T11:00:00Z"
}
```

**Error Cases**:
- 400: Invalid configuration
- 401: Unauthorized
- 403: Not Owner/Leader
- 404: Automation rule not found

---

### 14.4. Delete Automation Rule
**DELETE** `/automation/{automationId}`

**Description**: Delete automation rule. Requires Owner/Leader.

**Auth**: Require JWT (Owner/Leader)

**Path Params**:
- `automationId` (required): Automation rule ID

**Response** (204): No content

**Error Cases**:
- 401: Unauthorized
- 403: Not Owner/Leader
- 404: Automation rule not found

---

### 14.5. List Board Automation Rules
**GET** `/boards/{boardId}/automation`

**Description**: Get all automation rules for a board.

**Auth**: Require JWT (must be board member)

**Path Params**:
- `boardId` (required): Board ID

**Query Params**:
- `enabledOnly` (optional, default: false): Only enabled rules

**Response** (200):
```json
{
  "rules": [
    {
      "id": "automation_123",
      "boardId": "board_123",
      "name": "Auto-approve high priority done cards",
      "enabled": true,
      "trigger": {
        "type": "card_moved_to_done",
        "conditions": {
          "priority": "high"
        }
      },
      "executionCount": 5,
      "createdAt": "2024-01-20T10:00:00Z",
      "updatedAt": "2024-01-20T10:00:00Z"
    }
  ],
  "total": 3
}
```

**Error Cases**:
- 401: Unauthorized
- 403: Not a board member
- 404: Board not found

---

## COMMON ERROR RESPONSES

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid input data",
  "details": {
    "field": "email",
    "reason": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 422 Unprocessable Entity
```json
{
  "error": "Validation Error",
  "message": "Validation failed",
  "details": [
    {
      "field": "dueDate",
      "message": "Date must be in the future"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## DATA MODELS

### User
```json
{
  "id": "string (UUID)",
  "googleId": "string",
  "name": "string",
  "email": "string",
  "avatarUrl": "string (URL)",
  "telegramChatId": "string (nullable)",
  "createdAt": "ISO 8601 datetime",
  "lastLoginAt": "ISO 8601 datetime",
  "role": "user | admin"
}
```

### Board
```json
{
  "id": "string (UUID)",
  "name": "string",
  "description": "string (nullable)",
  "background": {
    "type": "color | image",
    "value": "string (hex color or URL)"
  },
  "ownerId": "string (UUID)",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

### BoardMember
```json
{
  "id": "string (UUID)",
  "boardId": "string (UUID)",
  "userId": "string (UUID)",
  "role": "owner | leader | member",
  "joinedAt": "ISO 8601 datetime"
}
```

### List
```json
{
  "id": "string (UUID)",
  "boardId": "string (UUID)",
  "name": "string",
  "position": "integer",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

### Card
```json
{
  "id": "string (UUID)",
  "listId": "string (UUID)",
  "boardId": "string (UUID)",
  "title": "string",
  "description": "string (nullable)",
  "position": "integer",
  "status": "todo | inProgress | waitingForApproval | done | rejected",
  "dueDate": "YYYY-MM-DD (nullable)",
  "assigneeId": "string (UUID, nullable)",
  "priority": "low | medium | high",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

### ChecklistItem
```json
{
  "id": "string (UUID)",
  "cardId": "string (UUID)",
  "title": "string",
  "isCompleted": "boolean",
  "position": "integer",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

### Label
```json
{
  "id": "string (UUID)",
  "boardId": "string (UUID)",
  "name": "string",
  "color": "string (hex color)",
  "createdAt": "ISO 8601 datetime"
}
```

### Comment
```json
{
  "id": "string (UUID)",
  "cardId": "string (UUID)",
  "content": "string",
  "authorId": "string (UUID)",
  "mentions": ["string (user IDs)"],
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

### Attachment
```json
{
  "id": "string (UUID)",
  "cardId": "string (UUID)",
  "name": "string",
  "url": "string (URL)",
  "mimeType": "string",
  "size": "integer (bytes)",
  "uploadedById": "string (UUID)",
  "createdAt": "ISO 8601 datetime"
}
```

### ActivityLog
```json
{
  "id": "string (UUID)",
  "boardId": "string (UUID)",
  "cardId": "string (UUID, nullable)",
  "type": "string",
  "description": "string",
  "userId": "string (UUID)",
  "metadata": "object (JSON)",
  "createdAt": "ISO 8601 datetime"
}
```

### AutomationRule
```json
{
  "id": "string (UUID)",
  "boardId": "string (UUID)",
  "name": "string",
  "enabled": "boolean",
  "trigger": {
    "type": "string",
    "conditions": "object (JSON)"
  },
  "actions": [
    {
      "type": "string",
      "value": "any"
    }
  ],
  "executionCount": "integer",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

---

## PAGINATION

All list endpoints support pagination using `limit` and `offset` query parameters.

**Default values**:
- `limit`: 20 (or endpoint-specific default)
- `offset`: 0

**Response format**:
```json
{
  "items": [...],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

---

## SORTING

Endpoints that support sorting use `sortBy` and `order` query parameters.

**Available sort fields**: Endpoint-specific (e.g., `updatedAt`, `createdAt`, `name`, `position`)

**Order values**: `asc`, `desc`

**Default**: Usually `updatedAt` descending

---

## DATE FORMATS

- **ISO 8601**: Used for all datetime fields (e.g., `2024-01-20T10:00:00Z`)
- **YYYY-MM-DD**: Used for date-only fields like `dueDate` (e.g., `2024-02-01`)

---

## RATE LIMITING

API rate limits (if applicable):
- **Standard**: 100 requests per minute per user
- **Burst**: 200 requests per minute per user
- **Upload endpoints**: 10 requests per minute per user

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642684800
```

