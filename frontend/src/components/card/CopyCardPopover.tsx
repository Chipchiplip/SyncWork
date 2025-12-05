import { useState, Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cardService } from '../../services/cardService'
import { listService } from '../../services/listService'
import { Card, List } from '../../types'

interface CopyCardPopoverProps {
    card: Card
}

export default function CopyCardPopover({ card }: CopyCardPopoverProps) {
    const queryClient = useQueryClient()
    const [selectedListId, setSelectedListId] = useState(card.listId)
    const [position, setPosition] = useState(card.position)
    const [title, setTitle] = useState(`${card.title} (Copy)`)

    const { data: listsData } = useQuery({
        queryKey: ['lists', card.boardId],
        queryFn: () => listService.getBoardLists(card.boardId),
    })

    const lists = listsData?.lists || []

    const copyCardMutation = useMutation({
        mutationFn: () => cardService.copyCard(card.id, selectedListId, position, title),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cards', card.listId] })
            queryClient.invalidateQueries({ queryKey: ['cards', selectedListId] })
        },
    })

    const handleCopy = (close: () => void) => {
        copyCardMutation.mutate()
        close()
    }

    return (
        <Popover className="relative">
            {({ close }) => (
                <>
                    <Popover.Button className="w-full text-left px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium text-gray-700 transition-colors">
                        Copy
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
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Copy Card</h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Destination List
                                    </label>
                                    <select
                                        value={selectedListId}
                                        onChange={(e) => setSelectedListId(e.target.value)}
                                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        {lists?.map((list: List) => (
                                            <option key={list.id} value={list.id}>
                                                {list.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Position
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={position}
                                        onChange={(e) => setPosition(Number(e.target.value))}
                                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => handleCopy(close)}
                                        disabled={copyCardMutation.isPending}
                                        className="flex-1 px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        {copyCardMutation.isPending ? 'Copying...' : 'Copy'}
                                    </button>
                                    <button
                                        onClick={() => close()}
                                        className="flex-1 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    )
}
