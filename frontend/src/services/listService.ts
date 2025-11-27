import api from './api'
import { List } from '../types'

export const listService = {
  async getBoardLists(boardId: string, includeCards = false) {
    const response = await api.get(`/boards/${boardId}/lists`, {
      params: { includeCards },
    })
    return response.data
  },

  async createList(boardId: string, data: { name: string; position: number }) {
    const response = await api.post(`/boards/${boardId}/lists`, data)
    return response.data
  },

  async updateList(boardId: string, listId: string, data: Partial<List>) {
    const response = await api.patch(`/boards/${boardId}/lists/${listId}`, data)
    return response.data
  },

  async deleteList(boardId: string, listId: string) {
    await api.delete(`/boards/${boardId}/lists/${listId}`)
  },

  async reorderLists(boardId: string, listIds: string[]) {
    const response = await api.patch(`/boards/${boardId}/lists/reorder`, { listIds })
    return response.data
  },
}

