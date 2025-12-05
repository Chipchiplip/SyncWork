import api from './api'

export interface User {
    id: string
    name: string
    email: string
    avatarUrl?: string
    createdAt?: string
}

export const userService = {
    async getCurrentUser() {
        const response = await api.get('/users/me')
        return response.data
    },

    async updateProfile(data: { name: string; email: string }) {
        const response = await api.patch('/users/me', data)
        return response.data
    },

    async uploadAvatar(file: File) {
        const formData = new FormData()
        formData.append('avatar', file)

        const response = await api.post('/users/me/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    async changePassword(data: { currentPassword: string; newPassword: string }) {
        const response = await api.post('/users/me/password', data)
        return response.data
    },

    async searchUsers(query: string, limit = 20) {
        const response = await api.get('/users/search', {
            params: { q: query, limit },
        })
        return response.data
    },

    async getUserById(userId: string) {
        const response = await api.get(`/users/${userId}`)
        return response.data
    },
}
