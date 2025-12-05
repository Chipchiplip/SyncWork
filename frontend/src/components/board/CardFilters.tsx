import { Fragment, useState } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { Label } from '../../services/labelService'

interface CardFiltersProps {
    onFilterChange: (filters: FilterState) => void
    boardId: string
    labels: Label[]
}

export interface FilterState {
    search: string
    status?: string
    assigneeId?: string
    labelIds: string[]
    dueDateFrom?: string
    dueDateTo?: string
}

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'todo', label: 'To Do' },
    { value: 'inProgress', label: 'In Progress' },
    { value: 'waitingForApproval', label: 'Waiting for Approval' },
    { value: 'done', label: 'Done' },
    { value: 'rejected', label: 'Rejected' },
]

export default function CardFilters({ onFilterChange, labels }: CardFiltersProps) {
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        labelIds: [],
    })

    const activeFilterCount =
        (filters.status ? 1 : 0) +
        (filters.assigneeId ? 1 : 0) +
        (filters.labelIds.length) +
        (filters.dueDateFrom || filters.dueDateTo ? 1 : 0)

    const updateFilters = (newFilters: Partial<FilterState>) => {
        const updated = { ...filters, ...newFilters }
        setFilters(updated)
        onFilterChange(updated)
    }

    const handleSearchChange = (search: string) => {
        updateFilters({ search })
    }

    const handleStatusChange = (status: string) => {
        updateFilters({ status: status || undefined })
    }

    const toggleLabel = (labelId: string) => {
        const labelIds = filters.labelIds.includes(labelId)
            ? filters.labelIds.filter(id => id !== labelId)
            : [...filters.labelIds, labelId]
        updateFilters({ labelIds })
    }

    const clearFilters = () => {
        const cleared: FilterState = {
            search: '',
            labelIds: [],
        }
        setFilters(cleared)
        onFilterChange(cleared)
    }

    return (
        <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
                <svg
                    className="absolute left-3 top-2.5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    placeholder="Search cards..."
                    value={filters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                />
            </div>

            {/* Filters Popover */}
            <Popover className="relative">
                {({ close }) => (
                    <>
                        <Popover.Button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                            </svg>
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="ml-1 px-2 py-0.5 bg-primary text-white rounded-full text-xs">
                                    {activeFilterCount}
                                </span>
                            )}
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
                            <Popover.Panel className="absolute right-0 z-10 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-gray-700">Filter Cards</h3>
                                    {activeFilterCount > 0 && (
                                        <button
                                            onClick={() => {
                                                clearFilters()
                                                close()
                                            }}
                                            className="text-xs text-gray-500 hover:text-gray-700 underline"
                                        >
                                            Clear all
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {/* Status Filter */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={filters.status || ''}
                                            onChange={(e) => handleStatusChange(e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                                        >
                                            {STATUS_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Label Filter */}
                                    {labels.length > 0 && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-2">
                                                Labels
                                            </label>
                                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                                {labels.map((label) => (
                                                    <button
                                                        key={label.id}
                                                        onClick={() => toggleLabel(label.id)}
                                                        className={`w-full flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-colors ${filters.labelIds.includes(label.id) ? 'ring-2 ring-primary' : ''
                                                            }`}
                                                    >
                                                        <div
                                                            className="w-8 h-5 rounded"
                                                            style={{ backgroundColor: label.color }}
                                                        />
                                                        <span className="flex-1 text-left text-sm text-gray-900">{label.name}</span>
                                                        {filters.labelIds.includes(label.id) && (
                                                            <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Due Date Filter */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Due Date
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="date"
                                                value={filters.dueDateFrom || ''}
                                                onChange={(e) => updateFilters({ dueDateFrom: e.target.value || undefined })}
                                                className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="From"
                                            />
                                            <input
                                                type="date"
                                                value={filters.dueDateTo || ''}
                                                onChange={(e) => updateFilters({ dueDateTo: e.target.value || undefined })}
                                                className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="To"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t">
                                    <button
                                        onClick={() => close()}
                                        className="w-full px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary-dark"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </Popover.Panel>
                        </Transition>
                    </>
                )}
            </Popover>
        </div>
    )
}
