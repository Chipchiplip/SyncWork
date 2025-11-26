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

  async searchCards(boardId: string, query: string, filters?: any) {
    const response = await api.get(`/boards/${boardId}/cards/search`, {
      params: { q: query, ...filters },
    })
    return response.data
  },
}

