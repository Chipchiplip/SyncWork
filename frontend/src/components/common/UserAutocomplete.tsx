import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { userService, User } from '../../services/userService'

interface UserAutocompleteProps {
    onSelect: (user: User) => void
    placeholder?: string
    className?: string
}

export default function UserAutocomplete({ onSelect, placeholder = 'Search users...', className = '' }: UserAutocompleteProps) {
    const [query, setQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)

    const { data, isLoading } = useQuery({
        queryKey: ['users', 'search', query],
        queryFn: () => userService.searchUsers(query),
        enabled: query.length >= 2,
    })

    const users: User[] = data?.users || []

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (user: User) => {
        onSelect(user)
        setQuery('')
        setIsOpen(false)
    }

    const handleInputChange = (value: string) => {
        setQuery(value)
        setIsOpen(value.length >= 2)
    }

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <div className="relative">
                <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                </svg>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {isLoading ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">Searching...</div>
                    ) : users.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center italic">
                            {query.length < 2 ? 'Type at least 2 characters' : 'No users found'}
                        </div>
                    ) : (
                        <div className="py-1">
                            {users.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => handleSelect(user)}
                                    className="w-full px-4 py-2 hover:bg-gray-50 flex items-center gap-3 transition-colors text-left"
                                >
                                    {user.avatarUrl ? (
                                        <img
                                            src={user.avatarUrl}
                                            alt={user.name}
                                            className="h-8 w-8 rounded-full"
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
