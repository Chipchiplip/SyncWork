import api from './api'
import { Attachment } from '../types'

export const attachmentService = {
    async getCardAttachments(cardId: string) {
        const response = await api.get(`/cards/${cardId}/attachments`)
        return response.data
    },

    async uploadAttachment(cardId: string, file: File, name?: string) {
        const formData = new FormData()
        formData.append('file', file)
        if (name) formData.append('name', name)

        const response = await api.post(`/cards/${cardId}/attachments`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    async deleteAttachment(cardId: string, attachmentId: string) {
        await api.delete(`/cards/${cardId}/attachments/${attachmentId}`)
    },

    async getAttachment(cardId: string, attachmentId: string) {
        const response = await api.get(`/cards/${cardId}/attachments/${attachmentId}`)
        return response.data
    },
}
