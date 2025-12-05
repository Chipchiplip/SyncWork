import api from './api'
import { ActivityLog } from '../types'

export const activityLogService = {
    async getBoardActivityLogs(boardId: string, limit = 50, offset = 0): Promise<ActivityLog[]> {
        const response = await api.get(`/boards/${boardId}/activity-logs`, {
            params: { limit, offset },
        })
        return response.data
    },
}
