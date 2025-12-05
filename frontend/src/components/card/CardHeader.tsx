import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '../../types'
import { cardService } from '../../services/cardService'
import { useUIStore } from '../../store/uiStore'

interface CardHeaderProps {
    card: Card
}

export default function CardHeader({ card }: CardHeaderProps) {
    const { closeCardModal } = useUIStore()
    const [title, setTitle] = useState(card.title)
    const queryClient = useQueryClient()

    useEffect(() => {
        setTitle(card.title)
    }, [card.title])

    const updateTitleMutation = useMutation({
        mutationFn: (newTitle: string) => cardService.updateCard(card.id, { title: newTitle }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['card', card.id] })
            queryClient.invalidateQueries({ queryKey: ['cards', card.listId] })
        },
    })

    const handleTitleBlur = () => {
        if (title !== card.title && title.trim()) {
            updateTitleMutation.mutate(title)
        }
    }

    return (
        <div className="flex items-start justify-between">
            <div className="flex-1 mr-4">
                <div className="relative">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleTitleBlur}
                        className="w-full text-xl font-bold text-gray-900 border-none focus:ring-2 focus:ring-primary rounded px-2 py-1 -ml-2 bg-transparent hover:bg-gray-100 transition-colors"
                    />
                </div>
                <div className="mt-1 text-sm text-gray-500 px-0.5">
                    in list <span className="font-medium text-gray-700 underline decoration-dotted">To Do</span>
                </div>
            </div>
            <button
                type="button"
                className="text-gray-400 hover:text-gray-500 transition-colors"
                onClick={closeCardModal}
            >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    )
}
