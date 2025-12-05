import { useRef, useState, Fragment } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Combobox, Transition } from '@headlessui/react'
import { Card } from '../../types'
import { cardService } from '../../services/cardService'
import { userService } from '../../services/userService'
import { useUIStore } from '../../store/uiStore'
import MoveCardPopover from './MoveCardPopover'
import CopyCardPopover from './CopyCardPopover'

interface CardSidebarProps {
    card: Card
}

export default function CardSidebar({ card }: CardSidebarProps) {
    const queryClient = useQueryClient()
    const { openConfirmModal, closeCardModal } = useUIStore()
    const dateInputRef = useRef<HTMLInputElement>(null)

    const updateCardMutation = useMutation({
        mutationFn: (updates: Partial<Card>) => cardService.updateCard(card.id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['card', card.id] })
            queryClient.invalidateQueries({ queryKey: ['cards', card.listId] })
        },
    })

    const deleteCardMutation = useMutation({
        mutationFn: () => cardService.deleteCard(card.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cards', card.listId] })
            closeCardModal()
        },
    })

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateCardMutation.mutate({ status: e.target.value as any })
    }

    const handlePriorityChange = (priority: 'low' | 'medium' | 'high') => {
        updateCardMutation.mutate({ priority })
    }

    const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateCardMutation.mutate({ dueDate: e.target.value })
    }

    const handleDelete = () => {
        openConfirmModal({
            title: 'Delete Card',
            message: 'Are you sure you want to delete this card? This action cannot be undone.',
            type: 'danger',
            onConfirm: () => deleteCardMutation.mutate(),
        })
    }

    const [query, setQuery] = useState('')

    const { data: searchResults } = useQuery({
        queryKey: ['users', query],
        queryFn: () => userService.searchUsers(query),
        enabled: query.length > 0,
    })

    const assignUserMutation = useMutation({
        mutationFn: (userId: string) => cardService.assignUser(card.id, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['card', card.id] })
            queryClient.invalidateQueries({ queryKey: ['cards', card.listId] })
            setQuery('')
        },
    })

    const unassignUserMutation = useMutation({
        mutationFn: (userId: string) => cardService.unassignUser(card.id, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['card', card.id] })
            queryClient.invalidateQueries({ queryKey: ['cards', card.listId] })
        },
    })

    return (
        <div className="space-y-6">
            {/* Members */}
            <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Members</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                    {card.assignees?.map((user: any) => (
                        <div key={user.id} className="flex items-center gap-1 bg-gray-100 rounded-full pl-1 pr-2 py-0.5 border border-gray-200">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 rounded-full" />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="text-xs font-medium text-gray-700">{user.name}</span>
                            <button
                                onClick={() => unassignUserMutation.mutate(user.id)}
                                className="ml-1 text-gray-400 hover:text-red-500 rounded-full p-0.5 hover:bg-red-50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>

                <Combobox onChange={(user: any) => assignUserMutation.mutate(user.id)}>
                    <div className="relative">
                        <Combobox.Input
                            className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search members..."
                        />
                        <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                            afterLeave={() => setQuery('')}
                        >
                            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
                                {searchResults?.length === 0 && query !== '' ? (
                                    <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                        Nothing found.
                                    </div>
                                ) : (
                                    searchResults?.map((user: any) => (
                                        <Combobox.Option
                                            key={user.id}
                                            className={({ active }) =>
                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-primary text-white' : 'text-gray-900'
                                                }`
                                            }
                                            value={user}
                                        >
                                            {({ selected, active }) => (
                                                <>
                                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                        {user.name}
                                                    </span>
                                                    {selected ? (
                                                        <span
                                                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-primary'
                                                                }`}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                        </span>
                                                    ) : null}
                                                </>
                                            )}
                                        </Combobox.Option>
                                    ))
                                )}
                            </Combobox.Options>
                        </Transition>
                    </div>
                </Combobox>
            </div>

            {/* Status */}
            <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Status</h3>
                <div className="relative">
                    <select
                        value={card.status}
                        onChange={handleStatusChange}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                    >
                        <option value="todo">To Do</option>
                        <option value="inProgress">In Progress</option>
                        <option value="waitingForApproval">Waiting for Approval</option>
                        <option value="done">Done</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Priority */}
            <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Priority</h3>
                <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => handlePriorityChange(p)}
                            className={`flex-1 py-1.5 text-xs font-medium rounded capitalize border transition-all ${card.priority === p
                                ? p === 'high'
                                    ? 'bg-red-100 text-red-700 border-red-200 ring-2 ring-red-500 ring-offset-1'
                                    : p === 'medium'
                                        ? 'bg-yellow-100 text-yellow-700 border-yellow-200 ring-2 ring-yellow-500 ring-offset-1'
                                        : 'bg-green-100 text-green-700 border-green-200 ring-2 ring-green-500 ring-offset-1'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Due Date */}
            <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Due Date</h3>
                <div className="relative">
                    <input
                        type="date"
                        ref={dateInputRef}
                        value={card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : ''}
                        onChange={handleDueDateChange}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>
            </div>

            {/* Actions */}
            <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Actions</h3>
                <div className="space-y-2">
                    <MoveCardPopover card={card} />
                    <CopyCardPopover card={card} />
                    <button
                        onClick={handleDelete}
                        className="w-full text-left px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm font-medium transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}
