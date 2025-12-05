import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'

interface QuickInputModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (value: string) => void
    title: string
    label: string
    placeholder?: string
    isLoading?: boolean
}

export default function QuickInputModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    label,
    placeholder,
    isLoading
}: QuickInputModalProps) {
    const [value, setValue] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (value.trim()) {
            onSubmit(value.trim())
            setValue('')
        }
    }

    const handleClose = () => {
        setValue('')
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
                                    {title}
                                </Dialog.Title>

                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="input-value" className="block text-sm font-medium text-gray-700 mb-1">
                                                {label} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="input-value"
                                                type="text"
                                                value={value}
                                                onChange={(e) => setValue(e.target.value)}
                                                placeholder={placeholder}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                autoFocus
                                                required
                                            />
                                        </div>
                                    </div>

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
                                            disabled={isLoading || !value.trim()}
                                            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? 'Creating...' : 'Create'}
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
