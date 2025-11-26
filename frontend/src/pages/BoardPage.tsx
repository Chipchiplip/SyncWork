import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { boardService } from '../services/boardService'
import { Board, List } from '../types'

function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const [board, setBoard] = useState<Board | null>(null)
  const [lists, setLists] = useState<List[]>([])

  useEffect(() => {
    if (boardId) {
      loadBoard()
      loadLists()
    }
  }, [boardId])

  const loadBoard = async () => {
    if (!boardId) return
    try {
      const data = await boardService.getBoardById(boardId)
      setBoard(data)
    } catch (error) {
      console.error('Error loading board:', error)
    }
  }

  const loadLists = async () => {
    if (!boardId) return
    try {
      // TODO: Implement list service
      // const data = await listService.getBoardLists(boardId)
      // setLists(data.lists || [])
    } catch (error) {
      console.error('Error loading lists:', error)
    }
  }

  if (!board) {
    return <div>Loading...</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>{board.name}</h1>
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        {lists.map((list) => (
          <div key={list.id} style={{ minWidth: '300px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
            <h3>{list.name}</h3>
            {/* Cards will be rendered here */}
          </div>
        ))}
      </div>
    </div>
  )
}

export default BoardPage

