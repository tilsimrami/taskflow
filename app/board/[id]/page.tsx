'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Column, Card } from '@/types'
import { useRouter, useParams } from 'next/navigation'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function CardItem({ card, onDelete, onEdit }: { card: Card; onDelete: (id: string) => void; onEdit: (card: Card) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-700 rounded-lg p-3 cursor-grab active:cursor-grabbing border border-gray-600 hover:border-gray-400 transition-colors group"
    >
      <div className="flex items-start justify-between gap-2">
        <div {...attributes} {...listeners} className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium">{card.title}</p>
          {card.description && <p className="text-gray-400 text-xs mt-1 line-clamp-2">{card.description}</p>}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => onEdit(card)} className="text-gray-400 hover:text-white text-xs px-1">✏️</button>
          <button onClick={() => onDelete(card.id)} className="text-gray-400 hover:text-red-400 text-xs px-1">✕</button>
        </div>
      </div>
    </div>
  )
}

function ColumnComponent({
  column,
  cards,
  onAddCard,
  onDeleteCard,
  onEditCard,
  onDeleteColumn,
}: {
  column: Column
  cards: Card[]
  onAddCard: (columnId: string, title: string) => void
  onDeleteCard: (id: string) => void
  onEditCard: (card: Card) => void
  onDeleteColumn: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: column.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
  const [newCardTitle, setNewCardTitle] = useState('')
  const [showInput, setShowInput] = useState(false)

  const handleAdd = () => {
    if (!newCardTitle.trim()) return
    onAddCard(column.id, newCardTitle.trim())
    setNewCardTitle('')
    setShowInput(false)
  }

  return (
    <div ref={setNodeRef} style={style} className="bg-gray-800 rounded-xl w-72 shrink-0 flex flex-col max-h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <h3 {...attributes} {...listeners} className="font-semibold text-white text-sm cursor-grab active:cursor-grabbing">
          {column.title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs">{cards.length}</span>
          <button onClick={() => onDeleteColumn(column.id)} className="text-gray-600 hover:text-red-400 text-xs transition-colors">✕</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map(card => (
            <CardItem key={card.id} card={card} onDelete={onDeleteCard} onEdit={onEditCard} />
          ))}
        </SortableContext>

        {showInput ? (
          <div className="flex flex-col gap-2 mt-1">
            <input
              autoFocus
              type="text"
              placeholder="Kart başlığı..."
              value={newCardTitle}
              onChange={e => setNewCardTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowInput(false) }}
              className="bg-gray-700 text-white text-sm rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-2">
              <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">Ekle</button>
              <button onClick={() => setShowInput(false)} className="text-gray-400 hover:text-white text-xs px-2 transition-colors">İptal</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="text-gray-500 hover:text-gray-300 text-sm text-left px-1 py-1 mt-1 transition-colors"
          >
            + Kart ekle
          </button>
        )}
      </div>
    </div>
  )
}

export default function BoardPage() {
  const router = useRouter()
  const params = useParams()
  const boardId = params.id as string

  const [boardTitle, setBoardTitle] = useState('')
  const [columns, setColumns] = useState<Column[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [newColumnTitle, setNewColumnTitle] = useState('')
  const [showColumnInput, setShowColumnInput] = useState(false)
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  useEffect(() => {
    fetchBoard()
  }, [boardId])

  const fetchBoard = async () => {
    const { data: board } = await supabase.from('boards').select('title').eq('id', boardId).single()
    if (board) setBoardTitle(board.title)

    const { data: cols } = await supabase.from('columns').select('*').eq('board_id', boardId).order('position')
    if (cols) setColumns(cols)

    const { data: cds } = await supabase
      .from('cards')
      .select('*')
      .in('column_id', (cols || []).map(c => c.id))
      .order('position')
    if (cds) setCards(cds)

    setLoading(false)
  }

  const addColumn = async () => {
    if (!newColumnTitle.trim()) return
    const position = columns.length
    const { data, error } = await supabase
      .from('columns')
      .insert({ title: newColumnTitle.trim(), board_id: boardId, position })
      .select().single()
    if (!error && data) {
      setColumns([...columns, data])
      setNewColumnTitle('')
      setShowColumnInput(false)
    }
  }

  const deleteColumn = async (id: string) => {
    await supabase.from('columns').delete().eq('id', id)
    setColumns(columns.filter(c => c.id !== id))
    setCards(cards.filter(c => c.column_id !== id))
  }

  const addCard = async (columnId: string, title: string) => {
    const columnCards = cards.filter(c => c.column_id === columnId)
    const position = columnCards.length
    const { data, error } = await supabase
      .from('cards')
      .insert({ title, column_id: columnId, position })
      .select().single()
    if (!error && data) setCards([...cards, data])
  }

  const deleteCard = async (id: string) => {
    await supabase.from('cards').delete().eq('id', id)
    setCards(cards.filter(c => c.id !== id))
  }

  const saveEdit = async () => {
    if (!editingCard) return
    const { error } = await supabase
      .from('cards')
      .update({ title: editTitle, description: editDesc })
      .eq('id', editingCard.id)
    if (!error) {
      setCards(cards.map(c => c.id === editingCard.id ? { ...c, title: editTitle, description: editDesc } : c))
      setEditingCard(null)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const card = cards.find(c => c.id === event.active.id)
    if (card) setActiveCard(card)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeCard = cards.find(c => c.id === activeId)
    if (!activeCard) return

    const overCard = cards.find(c => c.id === overId)
    const overColumn = columns.find(c => c.id === overId)

    const targetColumnId = overCard ? overCard.column_id : overColumn ? overColumn.id : null
    if (!targetColumnId || activeCard.column_id === targetColumnId) return

    setCards(prev => prev.map(c => c.id === activeId ? { ...c, column_id: targetColumnId } : c))
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeCard = cards.find(c => c.id === activeId)
    if (!activeCard) return

    const columnCards = cards.filter(c => c.column_id === activeCard.column_id)
    const oldIndex = columnCards.findIndex(c => c.id === activeId)
    const newIndex = columnCards.findIndex(c => c.id === overId)

    if (oldIndex !== newIndex && newIndex !== -1) {
      const reordered = arrayMove(columnCards, oldIndex, newIndex)
      const otherCards = cards.filter(c => c.column_id !== activeCard.column_id)
      const updated = [...otherCards, ...reordered.map((c, i) => ({ ...c, position: i }))]
      setCards(updated)

      await Promise.all(reordered.map((c, i) =>
        supabase.from('cards').update({ position: i, column_id: activeCard.column_id }).eq('id', c.id)
      ))
    } else {
      await supabase.from('cards').update({ column_id: activeCard.column_id }).eq('id', activeId)
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Yükleniyor...</div>

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4 shrink-0">
        <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white transition-colors">← Geri</button>
        <h1 className="text-xl font-bold">{boardTitle}</h1>
      </header>

      <div className="flex-1 overflow-x-auto p-6">
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 items-start h-full">
            <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
              {columns.map(column => (
                <ColumnComponent
                  key={column.id}
                  column={column}
                  cards={cards.filter(c => c.column_id === column.id).sort((a, b) => a.position - b.position)}
                  onAddCard={addCard}
                  onDeleteCard={deleteCard}
                  onEditCard={(card) => { setEditingCard(card); setEditTitle(card.title); setEditDesc(card.description || '') }}
                  onDeleteColumn={deleteColumn}
                />
              ))}
            </SortableContext>

            <div className="bg-gray-800 rounded-xl w-72 shrink-0 p-3">
              {showColumnInput ? (
                <div className="flex flex-col gap-2">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Sütun adı..."
                    value={newColumnTitle}
                    onChange={e => setNewColumnTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addColumn(); if (e.key === 'Escape') setShowColumnInput(false) }}
                    className="bg-gray-700 text-white text-sm rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-2">
                    <button onClick={addColumn} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">Ekle</button>
                    <button onClick={() => setShowColumnInput(false)} className="text-gray-400 hover:text-white text-xs px-2 transition-colors">İptal</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowColumnInput(true)} className="text-gray-400 hover:text-white text-sm w-full text-left px-1 transition-colors">
                  + Sütun ekle
                </button>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeCard && (
              <div className="bg-gray-700 rounded-lg p-3 border border-blue-500 shadow-xl w-72 rotate-2">
                <p className="text-white text-sm font-medium">{activeCard.title}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {editingCard && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-lg font-bold mb-4">Kartı Düzenle</h2>
            <input
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 mb-3 border border-gray-700 focus:outline-none focus:border-blue-500"
              placeholder="Başlık"
            />
            <textarea
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 mb-4 border border-gray-700 focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Açıklama (isteğe bağlı)"
              rows={4}
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditingCard(null)} className="text-gray-400 hover:text-white px-4 py-2 rounded-lg transition-colors">İptal</button>
              <button onClick={saveEdit} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
