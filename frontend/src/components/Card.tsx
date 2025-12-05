import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card as CardType } from '../types'
import { cardService } from '../services/cardService'
import { hasChecklist, getChecklistProgress, formatChecklistProgress } from '../utils/cardUtils'

interface CardProps {
    card: CardType
    onClick?: () => void
}

const Card: React.FC<CardProps> = ({ card, onClick }) => {
    const queryClient = useQueryClient()
    const progress = getChecklistProgress(card)
    const showChecklist = hasChecklist(card)

    // Status toggle mutation for non-checklist cards
    const toggleStatusMutation = useMutation({
        mutationFn: async () => {
            const newStatus = card.status === 'done' ? 'inProgress' : 'done'
            return cardService.updateCard(card.id, { status: newStatus })
        },
        onMutate: async () => {
            // Optimistic update
            await queryClient.cancelQueries({ queryKey: ['cards', card.listId] })
            const previousCards = queryClient.getQueryData(['cards', card.listId])

            queryClient.setQueryData(['cards', card.listId], (old: any) => {
                if (!old) return old
                return old.map((c: CardType) =>
                    c.id === card.id
                        ? { ...c, status: c.status === 'done' ? 'inProgress' : 'done' }
                        : c
                )
            })

            return { previousCards }
        },
        onError: (_err, _variables, context) => {
            // Rollback on error
            if (context?.previousCards) {
                queryClient.setQueryData(['cards', card.listId], context.previousCards)
            }
            alert('Failed to update card status. Please try again.')
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cards', card.listId] })
            queryClient.invalidateQueries({ queryKey: ['card', card.id] })
        },
    })

    const handleCheckboxClick = (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent opening modal
        if (!showChecklist) {
            toggleStatusMutation.mutate()
        }
    }

    const getPriorityColor = (p?: string) => {
        switch (p) {
            case 'high':
                return 'bg-red-100 text-red-700 border-red-200'
            case 'medium':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case 'low':
                return 'bg-blue-100 text-blue-700 border-blue-200'
            default:
                return 'hidden'
        }
    }

    return (
        <div
            onClick={onClick}
            className="group relative overflow-hidden p-3 rounded-xl shadow-sm border border-gray-200 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] hover:border-primary/50 bg-white"
        >
            {/* Progress bar background - only for cards with checklist */}
            {showChecklist && progress.percentage > 0 && (
                <div
                    className="absolute top-0 left-0 bottom-0 bg-green-400 transition-all duration-300 rounded-xl"
                    style={{ width: `${progress.percentage}%`, zIndex: 0 }}
                />
            )}

            {/* Card content - rendered on top */}
            <div className="relative" style={{ zIndex: 1 }}>
                <div className="flex flex-col gap-2">
                    {/* Title */}
                    <h4 className={`text-sm font-medium leading-tight group-hover:text-primary transition-colors ${progress.percentage === 100 ? 'text-white' : 'text-gray-800'
                        }`}>
                        {card.title}
                    </h4>

                    <div className="flex items-center justify-between mt-1">
                        {/* Left side: Priority + Labels */}
                        <div className="flex items-center gap-1.5">
                            {/* Priority Tag */}
                            {card.priority && (
                                <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityColor(
                                        card.priority
                                    )}`}
                                >
                                    {card.priority.toUpperCase()}
                                </span>
                            )}

                            {/* Labels */}
                            {card.labels && card.labels.length > 0 && (
                                <div className="flex gap-1">
                                    {card.labels.slice(0, 3).map((label) => (
                                        <div
                                            key={label.id}
                                            className="w-6 h-4 rounded-sm"
                                            style={{ backgroundColor: label.color }}
                                            title={label.name}
                                        />
                                    ))}
                                    {card.labels.length > 3 && (
                                        <span className={`text-[10px] ${progress.percentage === 100 ? 'text-white' : 'text-gray-500'
                                            }`}>+{card.labels.length - 3}</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right side: Checkbox OR Progress */}
                        <div className="flex items-center gap-2">
                            {showChecklist ? (
                                /* Show progress for cards with checklist */
                                <div className={`flex items-center gap-1.5 text-xs font-medium ${progress.percentage === 100 ? 'text-white' : 'text-gray-600'
                                    }`}>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{formatChecklistProgress(progress.total, progress.completed)}</span>
                                </div>
                            ) : (
                                /* Show checkbox for cards without checklist */
                                <button
                                    onClick={handleCheckboxClick}
                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                    title={card.status === 'done' ? 'Mark as incomplete' : 'Mark as done'}
                                >
                                    {card.status === 'done' ? (
                                        <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </button>
                            )}

                            {/* Assignees */}
                            {card.assignees && card.assignees.length > 0 && (
                                <div className="flex -space-x-1.5">
                                    {card.assignees.slice(0, 3).map((assignee, index) => (
                                        <div
                                            key={assignee.id || index}
                                            className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center overflow-hidden"
                                            title={assignee.name}
                                        >
                                            {assignee.avatarUrl ? (
                                                <img
                                                    src={assignee.avatarUrl}
                                                    alt={assignee.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-600 uppercase">
                                                    {assignee.name.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                    {card.assignees.length > 3 && (
                                        <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-gray-600">
                                            +{card.assignees.length - 3}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Card
