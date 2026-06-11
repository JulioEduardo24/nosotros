'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  getPeruToday,
  toPeruDateString,
  formatDateES,
  formatMonthYear,
  getDaysInMonth,
  getMonthStartOffset,
  buildDateStr,
} from '@/lib/date-utils'

interface Event {
  id: string
  title: string
  description: string
  date: string
  time?: string
  user_id: string
  created_at: string
}

const DAY_HEADERS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState<string>(getPeruToday())
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) { router.push('/'); return }
    setUser(JSON.parse(userStr))
    fetchEvents()
  }, [router])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })
      if (error) throw error
      setEvents(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('Eliminar este evento?')) return
    try {
      const { error } = await supabase.from('events').delete().eq('id', eventId)
      if (error) throw error
      setEvents(prev => prev.filter(e => e.id !== eventId))
    } catch (err) {
      console.error(err)
    }
  }

  const prevMonth = () =>
    setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const nextMonth = () =>
    setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  const today = getPeruToday()
  const daysInMonth = getDaysInMonth(currentMonth)
  const startOffset = getMonthStartOffset(currentMonth)

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const eventsByDate = new Set(events.map(e => e.date))
  const eventsOnSelected = events.filter(e => e.date === selectedDate)

  const upcomingEvents = events.filter(e => e.date >= today).slice(0, 6)

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
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] -ml-2">
              <ArrowLeft size={16} />
              Volver
            </Button>
          </Link>
          <span className="text-sm font-semibold text-[hsl(var(--foreground))]">Eventos</span>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link href="/calendar/add-event">
              <Button size="sm" className="gap-1.5">
                <Plus size={14} />
                Nuevo
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Calendario */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold capitalize">
                    {formatMonthYear(currentMonth)}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
                      <ChevronLeft size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {DAY_HEADERS.map(d => (
                    <div key={d} className="text-center text-[10px] font-medium text-[hsl(var(--muted-foreground))] py-1">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {cells.map((day, idx) => {
                    if (!day) return <div key={idx} />
                    const dateStr = buildDateStr(currentMonth, day)
                    const isSelected = dateStr === selectedDate
                    const isToday = dateStr === today
                    const hasEvent = eventsByDate.has(dateStr)
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(dateStr)}
                        className={[
                          'relative flex flex-col items-center justify-center rounded-md aspect-square text-xs font-medium transition-colors',
                          isSelected
                            ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                            : isToday
                              ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] font-bold'
                              : 'hover:bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]',
                        ].join(' ')}
                      >
                        {day}
                        {hasEvent && (
                          <span className={[
                            'absolute bottom-0.5 w-1 h-1 rounded-full',
                            isSelected ? 'bg-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--primary))]'
                          ].join(' ')} />
                        )}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Eventos del dia seleccionado */}
          <div className="lg:col-span-3 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-[hsl(var(--foreground))] capitalize">
                {formatDateES(selectedDate)}
              </h2>
              {selectedDate === today && (
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Hoy</p>
              )}
            </div>

            {eventsOnSelected.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                    No hay eventos este dia
                  </p>
                  <Link href="/calendar/add-event">
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <Plus size={14} />
                      Agregar evento
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {eventsOnSelected.map(event => (
                  <Card key={event.id} className="border-l-2 border-l-[hsl(var(--primary))]">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[hsl(var(--foreground))] text-sm truncate">
                            {event.title}
                          </p>
                          {event.description && (
                            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 leading-relaxed">
                              {event.description}
                            </p>
                          )}
                          {event.time && (
                            <p className="text-xs text-[hsl(var(--primary))] mt-2 flex items-center gap-1">
                              <Clock size={11} />
                              {event.time}
                            </p>
                          )}
                        </div>
                        {user?.id === event.user_id && (
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] transition-colors shrink-0 mt-0.5"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Proximos eventos */}
        {upcomingEvents.length > 0 && (
          <div className="mt-10">
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-4">
              Proximos eventos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcomingEvents.map(event => (
                <button
                  key={event.id}
                  onClick={() => {
                    setSelectedDate(event.date)
                    const d = new Date(event.date + 'T12:00:00Z')
                    setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1))
                  }}
                  className="text-left"
                >
                  <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                    <CardContent className="py-3 px-4">
                      <p className="text-[10px] font-medium text-[hsl(var(--primary))] mb-1 capitalize">
                        {formatDateES(event.date, { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-sm font-semibold text-[hsl(var(--foreground))] truncate">
                        {event.title}
                      </p>
                      {event.description && (
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 line-clamp-1">
                          {event.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
