import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { boardService } from '../services/boardService'
import { Board } from '../types'

import { Menu, Transition, Dialog } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { useUIStore } from '../store/uiStore'
import CreateBoardModal from '../components/CreateBoardModal'

function DashboardPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { openConfirmModal } = useUIStore()
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false)
  const [isRenameBoardModalOpen, setIsRenameBoardModalOpen] = useState(false)
  const [renamingBoard, setRenamingBoard] = useState<Board | null>(null)
  const [newBoardName, setNewBoardName] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['boards'],
    queryFn: async () => {
      const response = await boardService.getBoards()
      return response
    },
  })

  const boards = data?.boards || []

  const createBoardMutation = useMutation({
    mutationFn: (newBoard: any) => boardService.createBoard(newBoard),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['boards'] })
      navigate(`/boards/${data.id}`)
    },
  })

  const deleteBoardMutation = useMutation({
    mutationFn: (boardId: string) => boardService.deleteBoard(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] })
    },
  })

  const updateBoardMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => boardService.updateBoard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] })
    },
  })

  const handleCreateBoard = (data: { name: string; description: string; backgroundColor: string }) => {
    createBoardMutation.mutate({
      name: data.name,
      description: data.description,
      background: { type: 'color', value: data.backgroundColor },
    })
    setIsCreateBoardModalOpen(false)
  }

  const handleDeleteBoard = (e: React.MouseEvent, boardId: string) => {
    e.stopPropagation()
    openConfirmModal({
      title: 'Delete Board',
      message: 'Are you sure you want to delete this board? All lists and cards will be permanently deleted.',
      type: 'danger',
      onConfirm: () => deleteBoardMutation.mutate(boardId),
    })
  }

  const handleRenameBoard = (e: React.MouseEvent, board: Board) => {
    e.stopPropagation()
    setRenamingBoard(board)
    setNewBoardName(board.name)
    setIsRenameBoardModalOpen(true)
  }

  const submitRename = () => {
    if (renamingBoard && newBoardName && newBoardName !== renamingBoard.name) {
      updateBoardMutation.mutate({ id: renamingBoard.id, data: { name: newBoardName } })
    }
    setIsRenameBoardModalOpen(false)
    setRenamingBoard(null)
    setNewBoardName('')
  }

  const handleColorChange = (e: React.MouseEvent, board: Board, color: string) => {
    e.stopPropagation()
    updateBoardMutation.mutate({ id: board.id, data: { background: { type: 'color', value: color } } })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-red-500">Error loading boards</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8 text-gray-800">
        <span className="text-2xl">📋</span>
        <h1 className="text-xl font-bold">Your Workspaces</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {boards.map((board: Board) => (
          <div
            key={board.id}
            onClick={() => navigate(`/boards/${board.id}`)}
            className="group relative h-28 p-3 rounded-lg cursor-pointer transition-all hover:brightness-90 shadow-sm"
            style={{ backgroundColor: board.background?.value || '#0079bf' }}
          >
            <h3 className="text-white font-bold text-base truncate pr-6 drop-shadow-sm">
              {board.name}
            </h3>

            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
              <Menu as="div" className="relative">
                <Menu.Button className="p-1 rounded hover:bg-black/20 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="19" cy="12" r="1" />
                    <circle cx="5" cy="12" r="1" />
                  </svg>
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-1 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="px-1 py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={(e) => handleRenameBoard(e, board)}
                            className={`${active ? 'bg-primary text-white' : 'text-gray-900'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                          >
                            Rename
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={(e) => handleDeleteBoard(e, board.id)}
                            className={`${active ? 'bg-red-500 text-white' : 'text-gray-900'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                          >
                            Delete
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                    <div className="px-1 py-1">
                      <div className="px-2 py-1 text-xs text-gray-500 font-semibold">Change Background</div>
                      <div className="grid grid-cols-5 gap-1 px-2 pb-2">
                        {['#0079bf', '#d29034', '#519839', '#b04632', '#89609e'].map((color) => (
                          <button
                            key={color}
                            onClick={(e) => handleColorChange(e, board, color)}
                            className="w-6 h-6 rounded-sm hover:opacity-80 transition-opacity ring-1 ring-gray-200"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        ))}

        <div
          onClick={() => setIsCreateBoardModalOpen(true)}
          className="h-28 p-3 rounded-lg cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors border-2 border-dashed border-gray-300 hover:border-gray-400"
        >
          <span className="text-sm font-medium">Create new board</span>
        </div>
      </div>

      {/* Create Board Modal */}
      <CreateBoardModal
        isOpen={isCreateBoardModalOpen}
        onClose={() => setIsCreateBoardModalOpen(false)}
        onSubmit={handleCreateBoard}
        isLoading={createBoardMutation.isPending}
      />

      {/* Rename Board Modal */}
      <Transition appear show={isRenameBoardModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsRenameBoardModalOpen(false)}>
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
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    Rename Board
                  </Dialog.Title>

                  <form onSubmit={(e) => { e.preventDefault(); submitRename(); }}>
                    <input
                      type="text"
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      autoFocus
                      required
                    />

                    <div className="mt-4 flex gap-3 justify-end">
                      <button
                        type="button"
                        onClick={() => setIsRenameBoardModalOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!newBoardName.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md transition-colors disabled:opacity-50"
                      >
                        Rename
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default DashboardPage
