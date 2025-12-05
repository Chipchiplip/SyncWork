import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '../../types'
import { checklistService, ChecklistItem } from '../../services/checklistService'
import { cardService } from '../../services/cardService'

interface CardChecklistProps {
    card: Card
}

export default function CardChecklist({ card }: CardChecklistProps) {
    const queryClient = useQueryClient()
    const [newItemText, setNewItemText] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editText, setEditText] = useState('')

    const { data, isLoading } = useQuery({
        queryKey: ['checklist', card.id],
        queryFn: () => checklistService.getCardChecklist(card.id),
    })

    const progress = data?.progress || { total: 0, completed: 0, percentage: 0, items: [] }
    const items: ChecklistItem[] = progress.items || []

    const createItemMutation = useMutation({
        mutationFn: (text: string) => checklistService.createChecklistItem(card.id, text),
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ['checklist', card.id] })
            queryClient.invalidateQueries({ queryKey: ['card', card.id] })
            queryClient.invalidateQueries({ queryKey: ['cards', card.listId] })
            setNewItemText('')
        },
    })

    const updateItemMutation = useMutation({
        mutationFn: ({ itemId, text }: { itemId: string; text: string }) =>
            checklistService.updateChecklistItem(card.id, itemId, text),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['checklist', card.id] })
            setEditingId(null)
            setEditText('')
        },
    })

    const toggleItemMutation = useMutation({
        mutationFn: (itemId: string) => checklistService.toggleChecklistItem(card.id, itemId),
        onSuccess: async (_, itemId) => {
            // Invalidate checklist first
            await queryClient.invalidateQueries({ queryKey: ['checklist', card.id] })

            // Get updated checklist data
            const updatedData = await queryClient.fetchQuery({
                queryKey: ['checklist', card.id],
                queryFn: () => checklistService.getCardChecklist(card.id),
            })

            const newProgress = updatedData?.progress || { total: 0, completed: 0, percentage: 0 }

            // Auto-update card status based on checklist completion
            if (newProgress.total > 0) {
                if (newProgress.percentage === 100 && card.status !== 'done') {
                    // 100% complete → mark as done
                    await cardService.updateCard(card.id, { status: 'done' })
                } else if (newProgress.percentage < 100 && card.status === 'done') {
                    // < 100% complete → mark as in progress
                    await cardService.updateCard(card.id, { status: 'inProgress' })
                }
            }

            // Invalidate card queries to refresh UI
            queryClient.invalidateQueries({ queryKey: ['card', card.id] })
            queryClient.invalidateQueries({ queryKey: ['cards', card.listId] })
        },
    })

    const deleteItemMutation = useMutation({
        mutationFn: (itemId: string) => checklistService.deleteChecklistItem(card.id, itemId),
        onSuccess: async () => {
            // Invalidate checklist first
            await queryClient.invalidateQueries({ queryKey: ['checklist', card.id] })

            // Get updated checklist data
            const updatedData = await queryClient.fetchQuery({
                queryKey: ['checklist', card.id],
                queryFn: () => checklistService.getCardChecklist(card.id),
            })

            const newProgress = updatedData?.progress || { total: 0, completed: 0, percentage: 0 }

            // Auto-update card status when items are deleted
            if (newProgress.total > 0 && newProgress.percentage < 100 && card.status === 'done') {
                // If was 100% but now < 100% after deletion → mark as in progress
                await cardService.updateCard(card.id, { status: 'inProgress' })
            }

            // Invalidate card queries to refresh UI
            queryClient.invalidateQueries({ queryKey: ['card', card.id] })
            queryClient.invalidateQueries({ queryKey: ['cards', card.listId] })
        },
    })

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault()
        if (newItemText.trim()) {
            createItemMutation.mutate(newItemText.trim())
        }
    }

    const handleEdit = (item: ChecklistItem) => {
        setEditingId(item.id)
        setEditText(item.text)
    }

    const handleUpdate = (itemId: string) => {
        if (editText.trim()) {
            updateItemMutation.mutate({ itemId, text: editText.trim() })
        }
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditText('')
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Checklist
                </h3>
                {progress.total > 0 && (
                    <span className="text-xs text-gray-600 font-medium">
                        {progress.completed}/{progress.total}
                    </span>
                )}
            </div>

            {/* Progress Bar */}
            {progress.total > 0 && (
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">{Math.round(progress.percentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${progress.percentage === 100 ? 'bg-green-500' : 'bg-primary'
                                }`}
                            style={{ width: `${progress.percentage}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Checklist Items */}
            <div className="space-y-2 mb-4">
                {isLoading ? (
                    <div className="text-center py-4 text-gray-500 text-sm">Loading checklist...</div>
                ) : items.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm italic">No checklist items yet</div>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="flex items-start gap-2 group">
                            <input
                                type="checkbox"
                                checked={item.isCompleted}
                                onChange={() => toggleItemMutation.mutate(item.id)}
                                className="mt-1 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                                disabled={toggleItemMutation.isPending}
                            />

                            {editingId === item.id ? (
                                <div className="flex-1 space-y-2">
                                    <input
                                        type="text"
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdate(item.id)}
                                            disabled={!editText.trim() || updateItemMutation.isPending}
                                            className="px-2 py-1 bg-primary text-white rounded text-xs font-medium hover:bg-primary-dark disabled:opacity-50"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-between group">
                                    <span
                                        className={`text-sm ${item.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                                            }`}
                                    >
                                        {item.text}
                                    </span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-1 text-gray-400 hover:text-gray-600"
                                            title="Edit"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => deleteItemMutation.mutate(item.id)}
                                            className="p-1 text-gray-400 hover:text-red-500"
                                            title="Delete"
                                            disabled={deleteItemMutation.isPending}
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Add New Item */}
            <form onSubmit={handleAddItem} className="flex gap-2">
                <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="Add an item..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                    type="submit"
                    disabled={!newItemText.trim() || createItemMutation.isPending}
                    className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {createItemMutation.isPending ? 'Adding...' : 'Add'}
                </button>
            </form>
        </div>
    )
}
