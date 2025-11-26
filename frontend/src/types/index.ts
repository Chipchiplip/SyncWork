// User Types
export interface User {
  id: string
  googleId: string
  name: string
  email: string
  avatarUrl?: string
  telegramChatId?: string
  createdAt: string
  lastLoginAt?: string
  role: string
}

// Board Types
export interface Board {
  id: string
  name: string
  description?: string
  background: Background
  ownerId: string
  userRole?: string
  memberCount: number
  listCount: number
  createdAt: string
  updatedAt: string
}

export interface Background {
  type: 'color' | 'image'
  value: string
}

// List Types
export interface List {
  id: string
  boardId: string
  name: string
  position: number
  cardCount: number
  createdAt: string
  updatedAt: string
}

// Card Types
export interface Card {
  id: string
  listId: string
  boardId: string
  title: string
  description?: string
  position: number
  status: 'todo' | 'inProgress' | 'waitingForApproval' | 'done' | 'rejected'
  dueDate?: string
  assignee?: User
  priority: 'low' | 'medium' | 'high'
  labels: Label[]
  checklistProgress: ChecklistProgress
  commentCount: number
  attachmentCount: number
  createdAt: string
  updatedAt: string
}

// Label Types
export interface Label {
  id: string
  boardId: string
  name: string
  color: string
  createdAt: string
}

// Checklist Types
export interface ChecklistItem {
  id: string
  cardId: string
  title: string
  isCompleted: boolean
  position: number
  createdAt: string
  updatedAt: string
}

export interface ChecklistProgress {
  total: number
  completed: number
  percentage: number
}

// Comment Types
export interface Comment {
  id: string
  cardId: string
  content: string
  author: User
  mentions: User[]
  createdAt: string
  updatedAt: string
}

// Attachment Types
export interface Attachment {
  id: string
  cardId: string
  name: string
  url: string
  mimeType: string
  size: number
  uploadedBy: User
  createdAt: string
}

// Notification Types
export interface Notification {
  id: string
  type: string
  title: string
  message: string
  cardId?: string
  boardId?: string
  isRead: boolean
  channels: string[]
  createdAt: string
}

// Activity Log Types
export interface ActivityLog {
  id: string
  boardId: string
  cardId?: string
  type: string
  description: string
  user: User
  metadata: Record<string, any>
  createdAt: string
}

// Automation Rule Types
export interface AutomationRule {
  id: string
  boardId: string
  name: string
  enabled: boolean
  trigger: Record<string, any>
  actions: Record<string, any>[]
  executionCount: number
  createdAt: string
  updatedAt: string
}

