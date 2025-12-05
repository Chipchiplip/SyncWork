import api from './api'

export interface ChecklistItem {
    id: string
    cardId: string
    text: string
    isCompleted: boolean
    position: number
    createdAt: string
    updatedAt: string
}

export interface ChecklistProgress {
    total: number
    completed: number
    percentage: number
    items: ChecklistItem[]
}

export const checklistService = {
    async getCardChecklist(cardId: string) {
        const response = await api.get(`/cards/${cardId}/checklist`)
        return response.data
    },

    async createChecklistItem(cardId: string, text: string, position?: number) {
        const response = await api.post(`/cards/${cardId}/checklist`, {
            text,
            position,
        })
        return response.data
    },

    async updateChecklistItem(cardId: string, itemId: string, text: string) {
        const response = await api.patch(`/cards/${cardId}/checklist/${itemId}`, {
            text,
        })
        return response.data
    },

    async toggleChecklistItem(cardId: string, itemId: string) {
        const response = await api.patch(`/cards/${cardId}/checklist/${itemId}/toggle`)
        return response.data
    },

    async deleteChecklistItem(cardId: string, itemId: string) {
        await api.delete(`/cards/${cardId}/checklist/${itemId}`)
    },
}
