import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { Card, Comment } from '../../types'
import { commentService } from '../../services/commentService'
import { useAuthStore } from '../../store/authStore'

interface CardCommentsProps {
    card: Card
}

export default function CardComments({ card }: CardCommentsProps) {
    const { user } = useAuthStore()
    const queryClient = useQueryClient()
    const [newComment, setNewComment] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editContent, setEditContent] = useState('')

    const { data, isLoading } = useQuery({
        queryKey: ['comments', card.id],
        queryFn: () => commentService.getCardComments(card.id),
    })

    const comments = data?.comments || []

    const addCommentMutation = useMutation({
        mutationFn: (content: string) => {
            const mentions = extractMentions(content)
            return commentService.createComment(card.id, content, mentions)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', card.id] })
            queryClient.invalidateQueries({ queryKey: ['card', card.id] })
            setNewComment('')
        },
    })

    const updateCommentMutation = useMutation({
        mutationFn: ({ commentId, content }: { commentId: string; content: string }) => {
            const mentions = extractMentions(content)
            return commentService.updateComment(card.id, commentId, content, mentions)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', card.id] })
            setEditingId(null)
            setEditContent('')
        },
    })

    const deleteCommentMutation = useMutation({
        mutationFn: (commentId: string) => commentService.deleteComment(card.id, commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', card.id] })
            queryClient.invalidateQueries({ queryKey: ['card', card.id] })
        },
    })

    // Extract @mentions from text
    const extractMentions = (text: string): string[] => {
        const mentionRegex = /@(\w+)/g
        const matches = text.match(mentionRegex)
        return matches ? matches.map(m => m.slice(1)) : []
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (newComment.trim()) {
            addCommentMutation.mutate(newComment)
        }
    }

    const handleEdit = (comment: Comment) => {
        setEditingId(comment.id)
        setEditContent(comment.content)
    }

    const handleUpdate = (commentId: string) => {
        if (editContent.trim()) {
            updateCommentMutation.mutate({ commentId, content: editContent })
        }
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditContent('')
    }

    return (
        <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                Activity
            </h3>

            {/* Add Comment */}
            <div className="flex gap-3 mb-6">
                <div className="flex-shrink-0">
                    {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full" />
                    ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
                            <textarea
                                rows={2}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="block w-full border-0 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 resize-none"
                                placeholder="Write a comment... (use @username to mention)"
                            />
                            <div className="py-2 px-3 bg-gray-50 flex justify-between items-center">
                                <span className="text-xs text-gray-500">Tip: Use @username to mention someone</span>
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || addCommentMutation.isPending}
                                    className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {addCommentMutation.isPending ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="text-center py-4 text-gray-500 text-sm">Loading comments...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm italic">No comments yet. Be the first to comment!</div>
                ) : (
                    comments.map((comment: Comment) => (
                        <div key={comment.id} className="flex gap-3 group">
                            <div className="flex-shrink-0">
                                {comment.author?.avatarUrl ? (
                                    <img src={comment.author.avatarUrl} alt={comment.author.name} className="h-8 w-8 rounded-full" />
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                        {comment.author?.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold text-gray-900">{comment.author?.name}</span>
                                    <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                                    {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                                        <span className="text-xs text-gray-400 italic">(edited)</span>
                                    )}
                                </div>

                                {editingId === comment.id ? (
                                    <div className="space-y-2">
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm text-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                            rows={3}
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleUpdate(comment.id)}
                                                disabled={!editContent.trim() || updateCommentMutation.isPending}
                                                className="px-3 py-1 bg-primary text-white rounded text-xs font-medium hover:bg-primary-dark disabled:opacity-50"
                                            >
                                                {updateCommentMutation.isPending ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200 shadow-sm whitespace-pre-wrap">
                                            {comment.content}
                                        </div>
                                        <div className="mt-1 flex gap-2">
                                            {user?.id === comment.author?.id && (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(comment)}
                                                        className="text-xs text-gray-500 hover:text-primary hover:underline"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteCommentMutation.mutate(comment.id)}
                                                        className="text-xs text-gray-500 hover:text-red-600 hover:underline"
                                                        disabled={deleteCommentMutation.isPending}
                                                    >
                                                        {deleteCommentMutation.isPending ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
