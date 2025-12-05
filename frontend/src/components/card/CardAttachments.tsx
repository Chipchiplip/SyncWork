import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { Card, Attachment } from '../../types'
import { attachmentService } from '../../services/attachmentService'

interface CardAttachmentsProps {
    card: Card
}

export default function CardAttachments({ card }: CardAttachmentsProps) {
    const queryClient = useQueryClient()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)

    const { data, isLoading } = useQuery({
        queryKey: ['attachments', card.id],
        queryFn: () => attachmentService.getCardAttachments(card.id),
    })

    const attachments = data?.attachments || []

    const uploadMutation = useMutation({
        mutationFn: (file: File) => attachmentService.uploadAttachment(card.id, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attachments', card.id] })
            queryClient.invalidateQueries({ queryKey: ['card', card.id] })
            if (fileInputRef.current) fileInputRef.current.value = ''
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (attachmentId: string) => attachmentService.deleteAttachment(card.id, attachmentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attachments', card.id] })
            queryClient.invalidateQueries({ queryKey: ['card', card.id] })
        },
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            uploadMutation.mutate(file)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files?.[0]
        if (file) {
            uploadMutation.mutate(file)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return '🖼️'
        if (mimeType.startsWith('video/')) return '🎥'
        if (mimeType.includes('pdf')) return '📄'
        if (mimeType.includes('word')) return '📝'
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
        return '📎'
    }

    return (
        <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                </svg>
                Attachments {attachments.length > 0 && `(${attachments.length})`}
            </h3>

            {/* Drag and Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`mb-4 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    disabled={uploadMutation.isPending}
                />
                <label
                    htmlFor="file-upload"
                    className={`cursor-pointer ${uploadMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {uploadMutation.isPending ? (
                        <div className="text-sm text-gray-600">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                            Uploading...
                        </div>
                    ) : (
                        <>
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="mt-2 text-sm text-gray-600">
                                <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Max file size: 10MB</p>
                        </>
                    )}
                </label>
            </div>

            {/* Attachments List */}
            <div className="space-y-2">
                {isLoading ? (
                    <div className="text-center py-4 text-gray-500 text-sm">Loading attachments...</div>
                ) : attachments.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm italic">No attachments yet</div>
                ) : (
                    attachments.map((attachment: Attachment) => (
                        <div key={attachment.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg group hover:bg-gray-50 transition-colors">
                            <div className="text-2xl">
                                {getFileIcon(attachment.mimeType)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-gray-900 truncate hover:text-primary hover:underline block"
                                >
                                    {attachment.name}
                                </a>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>{formatFileSize(attachment.size)}</span>
                                    <span>•</span>
                                    <span>{formatDistanceToNow(new Date(attachment.createdAt), { addSuffix: true })}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <a
                                    href={attachment.url}
                                    download
                                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                    title="Download"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                    </svg>
                                </a>
                                <button
                                    onClick={() => deleteMutation.mutate(attachment.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    title="Delete"
                                    disabled={deleteMutation.isPending}
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
