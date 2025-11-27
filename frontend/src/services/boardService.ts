import api from './api'
import { Board } from '../types'

export const boardService = {
  async getBoards(limit = 50, offset = 0, sortBy = 'updatedAt', order = 'desc') {
    const response = await api.get('/boards', {
      params: { limit, offset, sortBy, order },
    })
    return response.data
  },

  async getBoardById(boardId: string): Promise<Board> {
    const response = await api.get(`/boards/${boardId}`)
    return response.data
  },

  async createBoard(data: { name: string; description?: string; background?: any }) {
    const response = await api.post('/boards', data)
    return response.data
  },



  async updateBoard(boardId: string, data: Partial<Board>) {
    const response = await api.patch(`/boards/${boardId}`, data)
    return response.data
  },

  async deleteBoard(boardId: string) {
    await api.delete(`/boards/${boardId}`)
  },
}

