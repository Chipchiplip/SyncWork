import { Card } from '../types'

/**
 * Get progress color classes based on checklist completion percentage
 */
export function getProgressColor(percentage: number): string {
    if (percentage === 0) {
        return 'bg-white border-gray-200'
    } else if (percentage <= 20) {
        return 'bg-green-50 border-green-100'
    } else if (percentage <= 40) {
        return 'bg-green-100 border-green-200'
    } else if (percentage <= 60) {
        return 'bg-green-200 border-green-300'
    } else if (percentage <= 80) {
        return 'bg-green-300 border-green-400'
    } else if (percentage < 100) {
        return 'bg-green-400 border-green-500 text-gray-900'
    } else {
        // 100% complete
        return 'bg-green-500 border-green-600 text-white'
    }
}

/**
 * Get card color classes based on status and checklist progress
 */
export function getCardColorClasses(card: Card): string {
    // Priority 1: Rejected status
    if (card.status === 'rejected') {
        return 'bg-red-50 border-red-200'
    }

    // Priority 2: Has checklist - use progress color
    const progress = getChecklistProgress(card)
    if (progress.total > 0) {
        return getProgressColor(progress.percentage)
    }

    // Priority 3: Done status (no checklist)
    if (card.status === 'done') {
        return 'bg-green-100 border-green-200'
    }

    // Default: neutral
    return 'bg-white border-gray-200'
}

/**
 * Check if card has checklist items
 */
export function hasChecklist(card: Card): boolean {
    const progress = getChecklistProgress(card)
    return progress.total > 0
}

/**
 * Get checklist progress from card data
 */
export function getChecklistProgress(card: Card): {
    total: number
    completed: number
    percentage: number
} {
    // Try to use checklistProgress if it exists
    if (card.checklistProgress) {
        return {
            total: card.checklistProgress.total || 0,
            completed: card.checklistProgress.completed || 0,
            percentage: card.checklistProgress.percentage || 0,
        }
    }

    // Fallback: compute from items if available
    // (This might not be available on card tiles, but we try)
    return {
        total: 0,
        completed: 0,
        percentage: 0,
    }
}

/**
 * Format checklist progress as readable string
 */
export function formatChecklistProgress(total: number, completed: number): string {
    return `${completed}/${total}`
}
