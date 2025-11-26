import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { boardService } from '../services/boardService'
import { Board } from '../types'

function DashboardPage() {
  const [boards, setBoards] = useState<Board[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    loadBoards()
  }, [])

  const loadBoards = async () => {
    try {
      const data = await boardService.getBoards()
      setBoards(data.boards || [])
    } catch (error) {
      console.error('Error loading boards:', error)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>My Boards</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {boards.map((board) => (
          <div
            key={board.id}
            onClick={() => navigate(`/boards/${board.id}`)}
            style={{
              padding: '20px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: board.background?.value || '#0079bf',
              color: 'white',
            }}
          >
            <h3>{board.name}</h3>
            <p>{board.description}</p>
            <p>Members: {board.memberCount}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DashboardPage

