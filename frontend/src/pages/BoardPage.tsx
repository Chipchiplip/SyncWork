import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { boardService } from '../services/boardService'
import { listService } from '../services/listService'
import { cardService } from '../services/cardService'
import { signalRService } from '../services/signalRService'
import { List, Card as CardType } from '../types'
import Column from '../components/Column'
import Card from '../components/Card'
import { useUIStore } from '../store/uiStore'
import CardDetailModal from '../components/card/CardDetailModal'
import ActivityLogSidebar from '../components/ActivityLogSidebar'
import QuickInputModal from '../components/QuickInputModal'

function BoardPage() {
  const queryClient = useQueryClient()
  const { boardId } = useParams<{ boardId: string }>()
  const [searchQuery, setSearchQuery] = useState('')
  const { openCardModal, openConfirmModal } = useUIStore()
  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false)
  const [isCreateCardModalOpen, setIsCreateCardModalOpen] = useState(false)
  const [currentListId, setCurrentListId] = useState<string>('')

  // Initialize SignalR
  useEffect(() => {
    signalRService.init(queryClient)
  }, [queryClient])

  // Connect to board
  useEffect(() => {
    if (boardId) {
      signalRService.connect(boardId)
      return () => {
        signalRService.disconnect()
      }
    }
  }, [boardId])

  // Fetch board
  const { data: board, isLoading: boardLoading } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => boardService.getBoardById(boardId!),
    enabled: !!boardId,
  })

  // Fetch lists
  const { data: listsData, isLoading: listsLoading, refetch: refetchLists } = useQuery({
    queryKey: ['lists', boardId],
    queryFn: () => listService.getBoardLists(boardId!, true),
    enabled: !!boardId,
  })

  const lists = listsData?.lists || []

  // Fetch cards for each list
  const cardsQueries = useQueries({
    queries: lists.map((list: List) => ({
      queryKey: ['cards', list.id],
      queryFn: () => cardService.getCards(list.id),
    })),
  })

  const handleCreateList = async (name: string) => {
    if (!boardId) return

    try {
      await listService.createList(boardId, {
        name,
        position: lists.length,
      })
      refetchLists()
      setIsCreateListModalOpen(false)
    } catch (error) {
      console.error('Error creating list:', error)
      alert('Failed to create list')
    }
  }

  const handleCreateCard = async (title: string) => {
    try {
      await cardService.createCard(currentListId, {
        title,
        position: 0,
        priority: 'medium',
      })
      refetchLists()
      setIsCreateCardModalOpen(false)
      setCurrentListId('')
    } catch (error) {
      console.error('Error creating card:', error)
      alert('Failed to create card')
    }
  }

  const openCreateCardModal = (listId: string) => {
    setCurrentListId(listId)
    setIsCreateCardModalOpen(true)
  }

  const renameListMutation = useMutation({
    mutationFn: ({ listId, name }: { listId: string; name: string }) =>
      listService.updateList(boardId!, listId, { name }),
    onSuccess: () => {
      refetchLists()
    },
  })

  const deleteListMutation = useMutation({
    mutationFn: (listId: string) => listService.deleteList(boardId!, listId),
    onSuccess: () => {
      refetchLists()
    },
  })

  const handleRenameList = (listId: string, newName: string) => {
    renameListMutation.mutate({ listId, name: newName })
  }

  const handleDeleteList = (listId: string) => {
    openConfirmModal({
      title: 'Delete List',
      message: 'Are you sure you want to delete this list? All cards in this list will also be deleted.',
      type: 'danger',
      onConfirm: () => deleteListMutation.mutate(listId),
    })
  }

  const onDragEnd = (result: any) => {
    const { destination, source, type } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    if (type === 'list') {
      const newLists = Array.from(lists)
      const [removed] = newLists.splice(source.index, 1)
      newLists.splice(destination.index, 0, removed)

      // Optimistic update
      queryClient.setQueryData(['lists', boardId], { lists: newLists })

      // API call
      const listIds = newLists.map((l: any) => l.id)
      listService.reorderLists(boardId!, listIds)
      return
    }
  }

  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false)

  if (boardLoading || listsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl text-gray-500">Board not found</div>
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col h-[calc(100vh-48px)] bg-gray-50 relative overflow-hidden">
        {/* Top Bar / Board Header */}
        <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 leading-none">{board.name}</h1>
              <p className="text-xs text-gray-500 mt-1">Workspace / {board.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsActivityLogOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              title="Activity Log"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
              />
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
            </div>

            {/* Avatar Group Placeholder */}
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
                >
                  U{i}
                </div>
              ))}
              <button className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
                +
              </button>
            </div>
          </div>
        </div>

        {/* Board Content */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <Droppable droppableId="all-lists" direction="horizontal" type="list">
            {(provided) => (
              <div
                className="h-full p-6 flex items-start gap-6 min-w-max"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {lists.map((list: List, index: number) => {
                  const cardsData = cardsQueries[index]?.data as any
                  const cards = (cardsData?.cards || []) as CardType[]

                  return (
                    <Draggable key={list.id} draggableId={list.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <Column
                            title={list.name}
                            cardCount={cards.length}
                            onAddCard={() => openCreateCardModal(list.id)}
                            onRename={(newName) => handleRenameList(list.id, newName)}
                            onDelete={() => handleDeleteList(list.id)}
                          >
                            {cards.map((card: CardType) => (
                              <Card
                                key={card.id}
                                card={card}
                                onClick={() => openCardModal(card.id)}
                              />
                            ))}
                          </Column>
                        </div>
                      )}
                    </Draggable>
                  )
                })}
                {provided.placeholder}

                {/* Add List Button */}
                <button
                  onClick={() => setIsCreateListModalOpen(true)}
                  className="flex-shrink-0 w-[320px] h-12 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-500 font-medium hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                >
                  + Add another list
                </button>
              </div>
            )}
          </Droppable>
        </div>

        <CardDetailModal />
        <QuickInputModal
          isOpen={isCreateListModalOpen}
          onClose={() => setIsCreateListModalOpen(false)}
          onSubmit={handleCreateList}
          title="Create New List"
          label="List Name"
          placeholder="e.g., To Do, In Progress, Done"
        />
        <QuickInputModal
          isOpen={isCreateCardModalOpen}
          onClose={() => setIsCreateCardModalOpen(false)}
          onSubmit={handleCreateCard}
          title="Create New Card"
          label="Card Title"
          placeholder="What needs to be done?"
        />
        {boardId && (
          <ActivityLogSidebar
            boardId={boardId}
            isOpen={isActivityLogOpen}
            onClose={() => setIsActivityLogOpen(false)}
          />
        )}
      </div>
    </DragDropContext>
  )
}

export default BoardPage
