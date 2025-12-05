import { Menu, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'

interface ColumnProps {
    title: string
    cardCount?: number
    children: React.ReactNode
    onAddCard?: () => void
    onRename?: (newName: string) => void
    onDelete?: () => void
}

const Column: React.FC<ColumnProps> = ({ title, cardCount = 0, children, onAddCard, onRename, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [newTitle, setNewTitle] = useState(title)

    const handleRenameSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (newTitle.trim() && newTitle !== title) {
            onRename?.(newTitle)
        }
        setIsEditing(false)
    }

    return (
        <div className="flex-shrink-0 w-[320px] flex flex-col max-h-full bg-gray-100/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
            {/* Header */}
            <div className="p-4 flex items-center justify-between group">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {isEditing ? (
                        <form onSubmit={handleRenameSubmit} className="flex-1">
                            <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                onBlur={() => setIsEditing(false)}
                                autoFocus
                                className="w-full px-2 py-1 text-sm font-semibold text-gray-700 bg-white border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </form>
                    ) : (
                        <h3
                            onClick={() => {
                                setNewTitle(title)
                                setIsEditing(true)
                            }}
                            className="font-semibold text-gray-700 text-sm tracking-tight truncate cursor-pointer hover:bg-gray-200 px-2 py-1 rounded -ml-2 transition-colors"
                        >
                            {title}
                        </h3>
                    )}
                    <span className="bg-gray-200 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                        {cardCount}
                    </span>
                </div>

                <Menu as="div" className="relative">
                    <Menu.Button className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="19" cy="12" r="1" />
                            <circle cx="5" cy="12" r="1" />
                        </svg>
                    </Menu.Button>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                            <div className="px-1 py-1">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={() => {
                                                setNewTitle(title)
                                                setIsEditing(true)
                                            }}
                                            className={`${active ? 'bg-primary text-white' : 'text-gray-900'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                        >
                                            Rename
                                        </button>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={onDelete}
                                            className={`${active ? 'bg-red-500 text-white' : 'text-gray-900'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3 custom-scrollbar">
                {children}
            </div>

            {/* Footer */}
            <div className="p-3 pt-0">
                <button
                    onClick={onAddCard}
                    className="w-full flex items-center gap-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200/50 p-2 rounded-lg transition-all text-sm font-medium group"
                >
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </div>
                    Add new card
                </button>
            </div>
        </div>
    )
}

export default Column
