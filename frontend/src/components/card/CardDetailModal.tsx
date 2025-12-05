import { Fragment, useState, useEffect, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cardService } from '../../services/cardService'
import { useUIStore } from '../../store/uiStore'
import CardHeader from './CardHeader'
import CardSidebar from './CardSidebar'
import CardComments from './CardComments'
import CardAttachments from './CardAttachments'
import CardChecklist from './CardChecklist'

export default function CardDetailModal() {
    const { isCardModalOpen, activeCardId, closeCardModal } = useUIStore()
    const queryClient = useQueryClient()

    const [description, setDescription] = useState('')
    const [isEditingDesc, setIsEditingDesc] = useState(false)
    const descInputRef = useRef<HTMLTextAreaElement>(null)

    const { data: card, isLoading } = useQuery({
        queryKey: ['card', activeCardId],
        queryFn: () => cardService.getCardById(activeCardId!),
        enabled: !!activeCardId,
    })

    useEffect(() => {
        if (card) {
            setDescription(card.description || '')
        }
    }, [card])

    const updateDescMutation = useMutation({
        mutationFn: (newDesc: string) => cardService.updateCard(activeCardId!, { description: newDesc }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['card', activeCardId] })
            setIsEditingDesc(false)
        },
    })

    const handleSaveDesc = () => {
        updateDescMutation.mutate(description)
    }

    const handleCancelDesc = () => {
        setDescription(card?.description || '')
        setIsEditingDesc(false)
    }

    if (!activeCardId) return null

    return (
        <Transition.Root show={isCardModalOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={closeCardModal}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gray-50 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl min-h-[600px]">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-96">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                    </div>
                                ) : card ? (
                                    <div className="flex flex-col md:flex-row h-full">
                                        {/* Main Content */}
                                        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                                            <CardHeader card={card} />

                                            <div className="mt-6 space-y-8">
                                                {/* Description */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="text-sm font-semibold text-gray-900">Description</h3>
                                                        {!isEditingDesc && (
                                                            <button
                                                                onClick={() => setIsEditingDesc(true)}
                                                                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-gray-700 transition-colors"
                                                            >
                                                                Edit
                                                            </button>
                                                        )}
                                                    </div>

                                                    {isEditingDesc ? (
                                                        <div className="space-y-2">
                                                            <textarea
                                                                ref={descInputRef}
                                                                value={description}
                                                                onChange={(e) => setDescription(e.target.value)}
                                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px] text-sm"
                                                                placeholder="Add a more detailed description..."
                                                                autoFocus
                                                            />
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={handleSaveDesc}
                                                                    disabled={updateDescMutation.isPending}
                                                                    className="px-4 py-1.5 bg-primary text-white rounded hover:bg-primary-dark transition-colors text-sm font-medium disabled:opacity-50"
                                                                >
                                                                    {updateDescMutation.isPending ? 'Saving...' : 'Save'}
                                                                </button>
                                                                <button
                                                                    onClick={handleCancelDesc}
                                                                    className="px-4 py-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors text-sm"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            onClick={() => setIsEditingDesc(true)}
                                                            className="bg-white p-4 rounded-lg border border-gray-200 min-h-[60px] text-gray-700 text-sm cursor-pointer hover:bg-gray-50 transition-colors whitespace-pre-wrap"
                                                        >
                                                            {card.description || <span className="text-gray-400 italic">Add a more detailed description...</span>}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Checklist */}
                                                <div>
                                                    <CardChecklist card={card} />
                                                </div>

                                                {/* Attachments */}
                                                <div>
                                                    <CardAttachments card={card} />
                                                </div>

                                                {/* Comments */}
                                                <div>
                                                    <CardComments card={card} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sidebar */}
                                        <div className="w-full md:w-64 bg-gray-100 p-6 border-l border-gray-200">
                                            <CardSidebar card={card} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 text-center text-red-500">Failed to load card</div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}
