import api from './api'

export interface Label {
    id: string
    boardId: string
    name: string
    color: string
    createdAt: string
}

export const labelService = {
    async getBoardLabels(boardId: string) {
        const response = await api.get(`/boards/${boardId}/labels`)
        return response.data
    },

    async createLabel(boardId: string, name: string, color: string) {
        const response = await api.post(`/boards/${boardId}/labels`, { name, color })
        return response.data
    },

    async updateLabel(boardId: string, labelId: string, name: string, color: string) {
        const response = await api.patch(`/boards/${boardId}/labels/${labelId}`, { name, color })
        return response.data
    },

    async deleteLabel(boardId: string, labelId: string) {
        await api.delete(`/boards/${boardId}/labels/${labelId}`)
    },

    async getCardLabels(cardId: string) {
        const response = await api.get(`/cards/${cardId}/labels`)
        return response.data
    },

    async addLabelToCard(cardId: string, labelId: string) {
        const response = await api.post(`/cards/${cardId}/labels/${labelId}`)
        return response.data
    },

    async removeLabelFromCard(cardId: string, labelId: string) {
        await api.delete(`/cards/${cardId}/labels/${labelId}`)
    },
}
