import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { boardService } from '../services/boardService'
import { Board } from '../types'

function DashboardPage() {
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ['boards'],
    queryFn: async () => {
      const response = await boardService.getBoards()
      return response
    },
  })

  const boards = data?.boards || []

  const handleCreateBoard = async () => {
    const name = prompt('Enter board name:')
    if (!name) return

    try {
      const board = await boardService.createBoard({
        name,
        description: '',
        background: { type: 'color', value: '#0079bf' },
      })
      navigate(`/boards/${board.id}`)
    } catch (error) {
      console.error('Error creating board:', error)
      alert('Failed to create board')
    }
  }

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Loading boards...</div>
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Error loading boards</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>My Boards</h1>
        <button
          onClick={handleCreateBoard}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0079bf',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          + Create Board
        </button>
      </div>

      {boards.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>No boards yet. Create your first board!</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px',
          }}
        >
          {boards.map((board: Board) => (
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
                minHeight: '120px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 10px 0' }}>{board.name}</h3>
                {board.description && <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>{board.description}</p>}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '10px' }}>
                <span>Members: {board.memberCount}</span> • <span>Lists: {board.listCount}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DashboardPage
