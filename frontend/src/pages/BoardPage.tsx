import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { boardService } from '../services/boardService'
import { listService } from '../services/listService'
import { cardService } from '../services/cardService'
import { Board, List, Card } from '../types'

function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)

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

  const lists = listsData?.Lists || []

  // Fetch cards for each list
  const cardsQueries = lists.map((list: List) => ({
    queryKey: ['cards', list.id],
    queryFn: () => cardService.getCards(list.id),
  }))

  const handleCreateList = async () => {
    const name = prompt('Enter list name:')
    if (!name || !boardId) return

    try {
      await listService.createList(boardId, {
        name,
        position: lists.length,
      })
      refetchLists()
    } catch (error) {
      console.error('Error creating list:', error)
      alert('Failed to create list')
    }
  }

  const handleCreateCard = async (listId: string) => {
    const title = prompt('Enter card title:')
    if (!title) return

    try {
      await cardService.createCard(listId, {
        title,
        position: 0,
        priority: 'medium',
      })
      refetchLists()
    } catch (error) {
      console.error('Error creating card:', error)
      alert('Failed to create card')
    }
  }

  if (boardLoading || listsLoading) {
    return <div style={{ padding: '20px' }}>Loading...</div>
  }

  if (!board) {
    return <div style={{ padding: '20px' }}>Board not found</div>
  }

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: board.background?.value || '#0079bf' }}>
      <div style={{ marginBottom: '20px', color: 'white' }}>
        <h1>{board.name}</h1>
        {board.description && <p>{board.description}</p>}
      </div>

      <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
        {lists.map((list: List) => (
          <div
            key={list.id}
            style={{
              minWidth: '300px',
              padding: '10px',
              backgroundColor: '#f0f0f0',
              borderRadius: '8px',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3>{list.name}</h3>
              <span style={{ fontSize: '12px', color: '#666' }}>{list.cardCount}</span>
            </div>

            {/* Cards will be loaded here - simplified for now */}
            <div style={{ marginBottom: '10px' }}>
              <button
                onClick={() => handleCreateCard(list.id)}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#0079bf',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                + Add Card
              </button>
            </div>

            {/* TODO: Render cards here */}
          </div>
        ))}

        <div style={{ minWidth: '300px' }}>
          <button
            onClick={handleCreateList}
            style={{
              width: '100%',
              padding: '20px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px dashed rgba(255,255,255,0.5)',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            + Add List
          </button>
        </div>
      </div>
    </div>
  )
}

export default BoardPage
