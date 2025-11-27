import api from './api'
import { Comment } from '../types'

export const commentService = {
  async getCardComments(cardId: string, limit = 50, offset = 0) {
    const response = await api.get(`/cards/${cardId}/comments`, {
      params: { limit, offset },
    })
    return response.data
  },

  async createComment(cardId: string, content: string, mentions?: string[]) {
    const response = await api.post(`/cards/${cardId}/comments`, {
      content,
      mentions,
    })
    return response.data
  },

  async updateComment(cardId: string, commentId: string, content: string) {
    const response = await api.patch(`/cards/${cardId}/comments/${commentId}`, { content })
    return response.data
  },

  async deleteComment(cardId: string, commentId: string) {
    await api.delete(`/cards/${cardId}/comments/${commentId}`)
  },
}

