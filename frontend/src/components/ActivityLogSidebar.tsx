import { useQuery, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { activityLogService } from '../services/activityLogService'
import { ActivityLog } from '../types'
import { useEffect } from 'react'
import { signalRService } from '../services/signalrService'

interface ActivityLogSidebarProps {
    boardId: string
    isOpen: boolean
    onClose: () => void
}

export default function ActivityLogSidebar({ boardId, isOpen, onClose }: ActivityLogSidebarProps) {
    const queryClient = useQueryClient()

    const { data: logs, isLoading } = useQuery({
        queryKey: ['activity-logs', boardId],
        queryFn: () => activityLogService.getBoardActivityLogs(boardId),
        enabled: isOpen,
    })

    useEffect(() => {
        if (isOpen) {
            const handleActivityLogCreated = (log: ActivityLog) => {
                if (log.boardId === boardId) {
                    queryClient.setQueryData(['activity-logs', boardId], (oldLogs: ActivityLog[] = []) => {
                        return [log, ...oldLogs]
                    })
                }
            }

            signalRService.on('ActivityLogCreated', handleActivityLogCreated)

            return () => {
                signalRService.off('ActivityLogCreated', handleActivityLogCreated)
            }
        }
    }, [isOpen, boardId, queryClient])

    if (!isOpen) return null

    return (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-40 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">Activity</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                ) : logs?.length === 0 ? (
                    <div className="text-center text-gray-500 py-4 text-sm">No activity yet.</div>
                ) : (
                    logs?.map((log: ActivityLog) => (
                        <div key={log.id} className="flex gap-3 text-sm">
                            <div className="flex-shrink-0 mt-0.5">
                                {log.user.avatarUrl ? (
                                    <img src={log.user.avatarUrl} alt={log.user.name} className="w-8 h-8 rounded-full" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                        {log.user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-gray-800">
                                    <span className="font-semibold">{log.user.name}</span>{' '}
                                    {log.description}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
