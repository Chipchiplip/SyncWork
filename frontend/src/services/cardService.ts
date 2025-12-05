import api from './api'
import { Card } from '../types'

export const cardService = {
  async getCards(listId: string, filters?: any) {
    const response = await api.get(`/lists/${listId}/cards`, { params: filters })
    return response.data
  },

  async getCardById(cardId: string, options?: any): Promise<Card> {
    const response = await api.get(`/cards/${cardId}`, { params: options })
    return response.data
  },

  async createCard(listId: string, data: any) {
    const response = await api.post(`/lists/${listId}/cards`, data)
    return response.data
  },

  async updateCard(cardId: string, data: Partial<Card>) {
    const response = await api.patch(`/cards/${cardId}`, data)
    return response.data
  },

  async deleteCard(cardId: string) {
    await api.delete(`/cards/${cardId}`)
  },

  async moveCard(cardId: string, listId: string, position: number) {
    const response = await api.patch(`/cards/${cardId}/move`, { listId, position })
    return response.data
  },

  async copyCard(cardId: string, listId: string, position: number, title?: string) {
    const response = await api.post(`/cards/${cardId}/copy`, { listId, position, title })
    return response.data
  },

  async searchCards(boardId: string, query: string, filters?: any) {
    const response = await api.get(`/boards/${boardId}/cards/search`, {
      params: { q: query, ...filters },
    })
    return response.data
  },

  // Comments
  async getComments(cardId: string) {
    const response = await api.get(`/cards/${cardId}/comments`)
    return response.data
  },

  async addComment(cardId: string, content: string) {
    const response = await api.post(`/cards/${cardId}/comments`, { content })
    return response.data
  },

  async updateComment(cardId: string, commentId: string, content: string) {
    const response = await api.put(`/cards/${cardId}/comments/${commentId}`, { content })
    return response.data
  },

  async deleteComment(cardId: string, commentId: string) {
    await api.delete(`/cards/${cardId}/comments/${commentId}`)
  },

  // Attachments
  async getAttachments(cardId: string) {
    const response = await api.get(`/cards/${cardId}/attachments`)
    return response.data
  },

  async uploadAttachment(cardId: string, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post(`/cards/${cardId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  async deleteAttachment(cardId: string, attachmentId: string) {
    await api.delete(`/cards/${cardId}/attachments/${attachmentId}`)
  },

  // Members
  async assignUser(cardId: string, userId: string) {
    const response = await api.post(`/cards/${cardId}/assignees`, { userId })
    return response.data
  },

  async unassignUser(cardId: string, userId: string) {
    await api.delete(`/cards/${cardId}/assignees/${userId}`)
  },
}

