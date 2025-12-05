import * as signalR from '@microsoft/signalr'
import { QueryClient } from '@tanstack/react-query'

class SignalRService {
    private connection: signalR.HubConnection | null = null
    private queryClient: QueryClient | null = null
    private boardId: string | null = null
    private listeners: Record<string, ((data: any) => void)[]> = {}
    private isConnecting: boolean = false
    private abortController: AbortController | null = null

    public init(queryClient: QueryClient) {
        this.queryClient = queryClient
    }

    public on(eventType: string, callback: (data: any) => void) {
        if (!this.listeners[eventType]) {
            this.listeners[eventType] = []
        }
        this.listeners[eventType].push(callback)
    }

    public off(eventType: string, callback: (data: any) => void) {
        if (!this.listeners[eventType]) return
        this.listeners[eventType] = this.listeners[eventType].filter((cb) => cb !== callback)
    }

    private notifyListeners(eventType: string, data: any) {
        if (this.listeners[eventType]) {
            this.listeners[eventType].forEach((callback) => callback(data))
        }
    }

    public async connect(boardId: string) {
        // Prevent duplicate connections
        if (this.isConnecting) {
            console.log('Already connecting, skipping...')
            return
        }

        if (this.connection && this.boardId === boardId && this.connection.state === signalR.HubConnectionState.Connected) {
            console.log('Already connected to this board')
            return
        }

        this.isConnecting = true
        this.boardId = boardId
        this.abortController = new AbortController()

        // Stop existing connection if any
        if (this.connection) {
            try {
                await this.connection.stop()
            } catch (err) {
                console.log('Error stopping previous connection:', err)
            }
        }

        const token = localStorage.getItem('token')

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5000/hubs/boards', {
                accessTokenFactory: () => token || '',
            })
            .withAutomaticReconnect()
            .build()

        this.connection.on('CardCreated', (payload: any) => {
            console.log('SignalR: CardCreated', payload)
            if (this.queryClient) {
                this.queryClient.invalidateQueries({ queryKey: ['cards', payload.listId] })
            }
        })

        this.connection.on('CardUpdated', (payload: any) => {
            console.log('SignalR: CardUpdated', payload)
            if (this.queryClient) {
                this.queryClient.invalidateQueries({ queryKey: ['cards', payload.listId] })
                this.queryClient.invalidateQueries({ queryKey: ['card', payload.cardId] })
            }
        })

        this.connection.on('CardMoved', (payload: any) => {
            console.log('SignalR: CardMoved', payload)
            if (this.queryClient) {
                this.queryClient.invalidateQueries({ queryKey: ['cards', payload.fromListId] })
                this.queryClient.invalidateQueries({ queryKey: ['cards', payload.toListId] })
            }
        })

        this.connection.on('CardDeleted', (payload: any) => {
            console.log('SignalR: CardDeleted', payload)
            if (this.queryClient) {
                this.queryClient.invalidateQueries({ queryKey: ['cards', payload.listId] })
            }
        })

        this.connection.on('ListCreated', (payload: any) => {
            console.log('SignalR: ListCreated', payload)
            if (this.queryClient) {
                this.queryClient.invalidateQueries({ queryKey: ['lists', payload.boardId] })
            }
        })

        this.connection.on('ListUpdated', (payload: any) => {
            console.log('SignalR: ListUpdated', payload)
            if (this.queryClient) {
                this.queryClient.invalidateQueries({ queryKey: ['lists', payload.boardId] })
            }
        })

        this.connection.on('ListDeleted', (payload: any) => {
            console.log('SignalR: ListDeleted', payload)
            if (this.queryClient) {
                this.queryClient.invalidateQueries({ queryKey: ['lists', payload.boardId] })
            }
        })

        this.connection.on('CommentAdded', (payload: any) => {
            console.log('SignalR: CommentAdded', payload)
            if (this.queryClient) {
                this.queryClient.invalidateQueries({ queryKey: ['comments', payload.cardId] })
                this.queryClient.invalidateQueries({ queryKey: ['card', payload.cardId] })
            }
        })

        this.connection.on('CommentUpdated', (payload: any) => {
            console.log('SignalR: CommentUpdated', payload)
            if (this.queryClient) {
                this.queryClient.invalidateQueries({ queryKey: ['comments', payload.cardId] })
            }
        })

        this.connection.on('CommentDeleted', (payload: any) => {
            console.log('SignalR: CommentDeleted', payload)
            if (this.queryClient) {
                this.queryClient.invalidateQueries({ queryKey: ['comments', payload.cardId] })
                this.queryClient.invalidateQueries({ queryKey: ['card', payload.cardId] })
            }
        })

        this.connection.on('AttachmentAdded', (payload: any) => {
            console.log('SignalR: AttachmentAdded', payload)
            if (this.queryClient) {
                this.queryClient.invalidateQueries({ queryKey: ['attachments', payload.cardId] })
                this.queryClient.invalidateQueries({ queryKey: ['card', payload.cardId] })
            }
        })

        this.connection.on('AttachmentDeleted', (payload: any) => {
            console.log('SignalR: AttachmentDeleted', payload)
            if (this.queryClient) {
                this.queryClient.invalidateQueries({ queryKey: ['attachments', payload.cardId] })
                this.queryClient.invalidateQueries({ queryKey: ['card', payload.cardId] })
            }
        })

        this.connection.on('ActivityLogCreated', (payload: any) => {
            console.log('SignalR: ActivityLogCreated', payload)
            this.notifyListeners('ActivityLogCreated', payload)
        })

        try {
            if (!this.abortController?.signal.aborted) {
                await this.connection.start()
                console.log('SignalR Connected')

                if (!this.abortController?.signal.aborted && this.connection.state === signalR.HubConnectionState.Connected) {
                    await this.connection.invoke('JoinBoard', boardId)
                }
            }
        } catch (err) {
            if (!this.abortController?.signal.aborted) {
                console.error('SignalR Connection Error: ', err)
            }
        } finally {
            this.isConnecting = false
        }
    }

    public async disconnect() {
        // Abort any ongoing connection
        if (this.abortController) {
            this.abortController.abort()
            this.abortController = null
        }

        if (this.connection) {
            if (this.boardId && this.connection.state === signalR.HubConnectionState.Connected) {
                try {
                    await this.connection.invoke('LeaveBoard', this.boardId)
                } catch (err) {
                    // Silently ignore disconnect errors as the connection might already be closed
                    console.log('Error leaving board group:', err)
                }
            }

            try {
                await this.connection.stop()
            } catch (err) {
                console.log('Error stopping connection:', err)
            }

            this.connection = null
            this.boardId = null
        }

        this.isConnecting = false
    }
}

export const signalRService = new SignalRService()
