import { create } from 'zustand'

interface UIState {
    isCardModalOpen: boolean
    activeCardId: string | null
    openCardModal: (cardId: string) => void
    closeCardModal: () => void

    filters: {
        status: string[]
        labels: string[]
        assignees: string[]
        dueDate: string | null
    }
    setFilters: (filters: Partial<UIState['filters']>) => void

    confirmModal: {
        isOpen: boolean
        title: string
        message: string
        onConfirm: () => void
        onCancel: () => void
        type: 'danger' | 'info' | 'warning'
    }
    openConfirmModal: (config: { title: string; message: string; onConfirm: () => void; type?: 'danger' | 'info' | 'warning' }) => void
    closeConfirmModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
    isCardModalOpen: false,
    activeCardId: null,
    openCardModal: (cardId) => set({ isCardModalOpen: true, activeCardId: cardId }),
    closeCardModal: () => set({ isCardModalOpen: false, activeCardId: null }),

    filters: {
        status: [],
        labels: [],
        assignees: [],
        dueDate: null,
    },
    setFilters: (newFilters) =>
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
        })),

    confirmModal: {
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        onCancel: () => { },
        type: 'info',
    },
    openConfirmModal: ({ title, message, onConfirm, type = 'info' }) =>
        set({
            confirmModal: {
                isOpen: true,
                title,
                message,
                onConfirm,
                onCancel: () => set((state) => ({ confirmModal: { ...state.confirmModal, isOpen: false } })),
                type,
            },
        }),
    closeConfirmModal: () =>
        set((state) => ({
            confirmModal: { ...state.confirmModal, isOpen: false },
        })),
}))
