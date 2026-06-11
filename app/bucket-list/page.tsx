'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Check, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

// SQL to create the table in Supabase:
// create table bucket_list (
//   id uuid default gen_random_uuid() primary key,
//   title text not null,
//   is_done boolean default false,
//   created_by uuid,
//   created_at timestamptz default now()
// );

interface BucketItem {
  id: string
  title: string
  is_done: boolean
  created_at: string
  created_by: string
}

type Filter = 'all' | 'pending' | 'done'

export default function BucketListPage() {
  const [items, setItems] = useState<BucketItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) { router.push('/'); return }
    setUser(JSON.parse(userStr))
    fetchItems()
  }, [router])

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('bucket_list')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) throw error
      setItems(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setAdding(true)
    try {
      const { data, error } = await supabase
        .from('bucket_list')
        .insert({ title: newTitle.trim(), is_done: false, created_by: user?.id })
        .select()
        .single()
      if (error) throw error
      setItems(prev => [...prev, data])
      setNewTitle('')
    } catch (err) {
      console.error(err)
    } finally {
      setAdding(false)
    }
  }

  const toggleDone = async (item: BucketItem) => {
    try {
      const { error } = await supabase
        .from('bucket_list')
        .update({ is_done: !item.is_done })
        .eq('id', item.id)
      if (error) throw error
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_done: !i.is_done } : i))
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este plan?')) return
    try {
      const { error } = await supabase.from('bucket_list').delete().eq('id', id)
      if (error) throw error
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = items.filter(i => {
    if (filter === 'pending') return !i.is_done
    if (filter === 'done') return i.is_done
    return true
  })

  const doneCount = items.filter(i => i.is_done).length
  const totalCount = items.length

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] -ml-2">
              <ArrowLeft size={16} />
              Volver
            </Button>
          </Link>
          <span className="text-sm font-semibold text-[hsl(var(--foreground))]">Lista de planes</span>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8 animate-fade-in space-y-6">

        {/* Progreso */}
        <div>
          <div className="flex items-end justify-between mb-2">
            <div>
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                Cosas por hacer juntos
              </h2>
              {totalCount > 0 && (
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                  {doneCount} de {totalCount} completadas
                </p>
              )}
            </div>
            {totalCount > 0 && (
              <span className="text-sm font-semibold text-[hsl(var(--primary))]">
                {Math.round((doneCount / totalCount) * 100)}%
              </span>
            )}
          </div>
          {totalCount > 0 && (
            <div className="h-1.5 rounded-full bg-[hsl(var(--secondary))] overflow-hidden">
              <div
                className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-500"
                style={{ width: `${(doneCount / totalCount) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Agregar item */}
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Agregar un nuevo plan..."
            className="flex-1"
          />
          <Button type="submit" disabled={adding || !newTitle.trim()} className="gap-1.5 shrink-0">
            <Plus size={15} />
            Agregar
          </Button>
        </form>

        {/* Filtros */}
        {totalCount > 0 && (
          <div className="flex gap-1.5">
            {(['all', 'pending', 'done'] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  filter === f
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'
                )}
              >
                {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : 'Hechas'}
              </button>
            ))}
          </div>
        )}

        {/* Lista */}
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {filter === 'done'
                  ? 'Aun no han completado ninguna'
                  : filter === 'pending'
                    ? 'No hay planes pendientes'
                    : 'La lista esta vacia, agrega el primer plan'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map(item => (
              <div
                key={item.id}
                className={cn(
                  'group flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors',
                  item.is_done
                    ? 'bg-[hsl(var(--muted))] border-transparent'
                    : 'bg-[hsl(var(--card))] border-[hsl(var(--border))]'
                )}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleDone(item)}
                  className={cn(
                    'shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                    item.is_done
                      ? 'bg-[hsl(var(--primary))] border-[hsl(var(--primary))]'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]'
                  )}
                  aria-label={item.is_done ? 'Marcar como pendiente' : 'Marcar como hecho'}
                >
                  {item.is_done && <Check size={11} className="text-white" strokeWidth={3} />}
                </button>

                {/* Titulo */}
                <span className={cn(
                  'flex-1 text-sm',
                  item.is_done
                    ? 'line-through text-[hsl(var(--muted-foreground))]'
                    : 'text-[hsl(var(--foreground))]'
                )}>
                  {item.title}
                </span>

                {/* Eliminar */}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="shrink-0 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
        </div>
  )
}
