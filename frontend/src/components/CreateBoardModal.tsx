import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'

interface CreateBoardModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: { name: string; description: string; backgroundColor: string }) => void
    isLoading?: boolean
}

const BOARD_COLORS = [
    { name: 'Blue', value: '#0079bf' },
    { name: 'Orange', value: '#d29034' },
    { name: 'Green', value: '#519839' },
    { name: 'Red', value: '#b04632' },
    { name: 'Purple', value: '#89609e' },
    { name: 'Pink', value: '#cd5a91' },
    { name: 'Lime', value: '#4bbf6b' },
    { name: 'Sky', value: '#00aecc' },
    { name: 'Grey', value: '#838c91' },
]

export default function CreateBoardModal({ isOpen, onClose, onSubmit, isLoading }: CreateBoardModalProps) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [backgroundColor, setBackgroundColor] = useState('#0079bf')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (name.trim()) {
            onSubmit({ name, description, backgroundColor })
            // Reset form
            setName('')
            setDescription('')
            setBackgroundColor('#0079bf')
        }
    }

    const handleClose = () => {
        setName('')
        setDescription('')
        setBackgroundColor('#0079bf')
        onClose()
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                                >
                                    Create New Board
                                </Dialog.Title>

                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4">
                                        {/* Board Name */}
                                        <div>
                                            <label htmlFor="board-name" className="block text-sm font-medium text-gray-700 mb-1">
                                                Board Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="board-name"
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="e.g., Project Roadmap"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                autoFocus
                                                required
                                            />
                                        </div>

                                        {/* Board Description */}
                                        <div>
                                            <label htmlFor="board-description" className="block text-sm font-medium text-gray-700 mb-1">
                                                Description (optional)
                                            </label>
                                            <textarea
                                                id="board-description"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="What's this board about?"
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                            />
                                        </div>

                                        {/* Background Color */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Background Color
                                            </label>
                                            <div className="grid grid-cols-5 gap-2">
                                                {BOARD_COLORS.map((color) => (
                                                    <button
                                                        key={color.value}
                                                        type="button"
                                                        onClick={() => setBackgroundColor(color.value)}
                                                        className={`h-12 rounded-md transition-all ${backgroundColor === color.value
                                                                ? 'ring-4 ring-primary ring-offset-2'
                                                                : 'hover:ring-2 hover:ring-gray-300'
                                                            }`}
                                                        style={{ backgroundColor: color.value }}
                                                        title={color.name}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Preview */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Preview
                                            </label>
                                            <div
                                                className="h-24 rounded-lg p-3 flex items-start"
                                                style={{ backgroundColor }}
                                            >
                                                <span className="text-white font-bold drop-shadow-sm">
                                                    {name || 'Board Name'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-6 flex gap-3 justify-end">
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            disabled={isLoading}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading || !name.trim()}
                                            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? 'Creating...' : 'Create Board'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
