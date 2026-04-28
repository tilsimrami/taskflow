'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Board } from '@/types'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [newBoardTitle, setNewBoardTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [showInput, setShowInput] = useState(false)

  useEffect(() => {
    checkUser()
    fetchBoards()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.push('/login')
  }

  const fetchBoards = async () => {
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setBoards(data)
    setLoading(false)
  }

  const createBoard = async () => {
    if (!newBoardTitle.trim()) return
    setCreating(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data, error } = await supabase
      .from('boards')
      .insert({ title: newBoardTitle.trim(), user_id: session.user.id })
      .select()
      .single()

    if (!error && data) {
      setBoards([data, ...boards])
      setNewBoardTitle('')
      setShowInput(false)
    }
    setCreating(false)
  }

  const deleteBoard = async (id: string) => {
    await supabase.from('boards').delete().eq('id', id)
    setBoards(boards.filter(b => b.id !== id))
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-400">TaskFlow</h1>
        <button onClick={signOut} className="text-gray-400 hover:text-white text-sm transition-colors">
          Çıkış Yap
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Boardlarım</h2>
          <button
            onClick={() => setShowInput(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Yeni Board
          </button>
        </div>

        {showInput && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-6 flex gap-3">
            <input
              autoFocus
              type="text"
              placeholder="Board adı..."
              value={newBoardTitle}
              onChange={e => setNewBoardTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createBoard()}
              className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={createBoard}
              disabled={creating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
            >
              Oluştur
            </button>
            <button
              onClick={() => setShowInput(false)}
              className="text-gray-400 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors"
            >
              İptal
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-gray-400">Yükleniyor...</p>
        ) : boards.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg mb-2">Henüz board yok</p>
            <p className="text-sm">Yeni bir board oluşturarak başla</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map(board => (
              <div
                key={board.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-all group cursor-pointer"
                onClick={() => router.push(`/board/${board.id}`)}
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-lg">{board.title}</h3>
                  <button
                    onClick={e => { e.stopPropagation(); deleteBoard(board.id) }}
                    className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-sm"
                  >
                    Sil
                  </button>
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  {new Date(board.created_at).toLocaleDateString('tr-TR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
