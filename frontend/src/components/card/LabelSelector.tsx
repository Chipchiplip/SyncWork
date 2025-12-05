import { useState, Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '../../types'
import { labelService, Label } from '../../services/labelService'

interface LabelSelectorProps {
    card: Card
}

const LABEL_COLORS = [
    { name: 'Green', value: '#22c55e' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Gray', value: '#6b7280' },
]

export default function LabelSelector({ card }: LabelSelectorProps) {
    const queryClient = useQueryClient()
    const [isCreating, setIsCreating] = useState(false)
    const [newLabelName, setNewLabelName] = useState('')
    const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0].value)

    const { data: boardLabelsData } = useQuery({
        queryKey: ['labels', card.boardId],
        queryFn: () => labelService.getBoardLabels(card.boardId),
    })

    const { data: cardLabelsData } = useQuery({
        queryKey: ['card-labels', card.id],
        queryFn: () => labelService.getCardLabels(card.id),
    })

    const boardLabels: Label[] = boardLabelsData?.labels || []
    const cardLabels: Label[] = cardLabelsData?.labels || []
    const cardLabelIds = new Set(cardLabels.map(l => l.id))

    const createLabelMutation = useMutation({
        mutationFn: () => labelService.createLabel(card.boardId, newLabelName, selectedColor),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['labels', card.boardId] })
            setNewLabelName('')
            setSelectedColor(LABEL_COLORS[0].value)
            setIsCreating(false)
        },
    })

    const toggleLabelMutation = useMutation({
        mutationFn: ({ labelId, isAdding }: { labelId: string; isAdding: boolean }) => {
            if (isAdding) {
                return labelService.addLabelToCard(card.id, labelId)
            } else {
                return labelService.removeLabelFromCard(card.id, labelId)
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['card-labels', card.id] })
            queryClient.invalidateQueries({ queryKey: ['card', card.id] })
        },
    })

    const handleToggleLabel = (labelId: string, isAdding: boolean) => {
        toggleLabelMutation.mutate({ labelId, isAdding })
    }

    const handleCreateLabel = (e: React.FormEvent) => {
        e.preventDefault()
        if (newLabelName.trim()) {
            createLabelMutation.mutate()
        }
    }

    return (
        <Popover className="relative">
            {({ close }) => (
                <>
                    <Popover.Button className="w-full text-left px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium text-gray-700 transition-colors flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                        </svg>
                        Labels
                    </Popover.Button>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Popover.Panel className="absolute left-0 z-10 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Labels</h3>

                            {/* Labels List */}
                            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                                {boardLabels.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic text-center py-2">No labels yet</p>
                                ) : (
                                    boardLabels.map((label) => {
                                        const isSelected = cardLabelIds.has(label.id)
                                        return (
                                            <button
                                                key={label.id}
                                                onClick={() => handleToggleLabel(label.id, !isSelected)}
                                                className={`w-full flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition-colors ${isSelected ? 'ring-2 ring-primary' : ''
                                                    }`}
                                            >
                                                <div
                                                    className="w-10 h-6 rounded"
                                                    style={{ backgroundColor: label.color }}
                                                />
                                                <span className="flex-1 text-left text-sm text-gray-900">{label.name}</span>
                                                {isSelected && (
                                                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                    </svg>
                                                )}
                                            </button>
                                        )
                                    })
                                )}
                            </div>

                            {/* Create New Label */}
                            {isCreating ? (
                                <form onSubmit={handleCreateLabel} className="space-y-3 border-t pt-3">
                                    <input
                                        type="text"
                                        value={newLabelName}
                                        onChange={(e) => setNewLabelName(e.target.value)}
                                        placeholder="Label name"
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                                        autoFocus
                                        required
                                    />
                                    <div className="grid grid-cols-5 gap-1">
                                        {LABEL_COLORS.map((color) => (
                                            <button
                                                key={color.value}
                                                type="button"
                                                onClick={() => setSelectedColor(color.value)}
                                                className={`h-8 rounded transition-all ${selectedColor === color.value ? 'ring-2 ring-gray-800 ring-offset-1' : ''
                                                    }`}
                                                style={{ backgroundColor: color.value }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={!newLabelName.trim() || createLabelMutation.isPending}
                                            className="flex-1 px-3 py-1.5 bg-primary text-white rounded text-sm font-medium hover:bg-primary-dark disabled:opacity-50"
                                        >
                                            {createLabelMutation.isPending ? 'Creating...' : 'Create'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsCreating(false)
                                                setNewLabelName('')
                                                setSelectedColor(LABEL_COLORS[0].value)
                                            }}
                                            className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="w-full px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors border-t pt-3"
                                >
                                    + Create new label
                                </button>
                            )}
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    )
}
