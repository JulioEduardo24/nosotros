'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Clock, Calendar, Heart, Sparkles } from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string
  date: string
  time?: string
  user_id: string
  created_at: string
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [eventsOnDate, setEventsOnDate] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        router.push('/')
      } else {
        const user = JSON.parse(userStr)
        setUser(user)
        await fetchEvents()
      }
      setLoading(false)
    }
    checkAuth()
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
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const dateStr = selectedDate.toISOString().split('T')[0]
    const dayEvents = events.filter((e) => e.date === dateStr)
    setEventsOnDate(dayEvents)
  }, [selectedDate, events])

  const handleDelete = async (eventId: string) => {
    if (!confirm('¿Estás seguro?')) return

    try {
      const { error } = await supabase.from('events').delete().eq('id', eventId)
      if (error) throw error
      setEvents(events.filter((e) => e.id !== eventId))
    } catch (err) {
      console.error('Error deleting event:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <Calendar size={60} className="text-purple-600 animate-bounce" />
      </div>
    )
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const daysInMonth = getDaysInMonth(selectedDate)
  const firstDay = getFirstDayOfMonth(selectedDate)
  const days = []

  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const hasEventOnDate = (day: number | null) => {
    if (!day) return false
    const dateStr = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
      .toISOString()
      .split('T')[0]
    return events.some((e) => e.date === dateStr)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <header className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
            <ArrowLeft size={24} />
            <span className="font-semibold">Volver</span>
          </Link>
          <h1 className="text-3xl font-bold text-purple-700 flex items-center gap-2">
            <Calendar size={32} className="text-purple-600" />
            Nuestros Eventos
          </h1>
          <Link href="/calendar/add-event">
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition">
              <Plus size={20} />
              Nuevo Evento
            </button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-purple-700 mb-4">
              {selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </h3>

            <div className="grid grid-cols-7 gap-2">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, idx) => (
                <div key={`header-${idx}`} className="text-center font-bold text-gray-600 text-sm">
                  {day}
                </div>
              ))}

              {days.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (day) {
                      setSelectedDate(
                        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
                      )
                    }
                  }}
                  className={`p-2 text-sm rounded-lg transition ${day === null
                    ? 'text-transparent'
                    : day === selectedDate.getDate()
                      ? 'bg-purple-600 text-white font-bold'
                      : hasEventOnDate(day)
                        ? 'bg-purple-100 text-purple-700 font-bold'
                        : 'hover:bg-gray-100'
                    }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-purple-700 mb-6">
                {selectedDate.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h2>

              {eventsOnDate.length === 0 ? (
                <div className="text-center py-8">
                  <Heart size={80} className="mx-auto text-purple-300 mb-4" />
                  <p className="text-gray-600 mb-6">
                    No hay eventos en este día.
                  </p>
                  <Link href="/calendar/add-event">
                    <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2 mx-auto">
                      <Plus size={20} />
                      Crear Evento
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {eventsOnDate.map((event) => (
                    <div
                      key={event.id}
                      className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-l-4 border-purple-500"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-purple-900">
                          {event.title}
                        </h3>
                        {user?.id === event.user_id && (
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="text-red-500 hover:text-red-700 transition"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>

                      <p className="text-gray-700 mb-4">{event.description}</p>

                      {event.time && (
                        <div className="flex items-center gap-2 text-purple-600 font-semibold">
                          <Clock size={18} />
                          {event.time}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {events.length > 0 && (
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-purple-700 mb-6 flex items-center gap-2">
              <Sparkles size={28} className="text-purple-600" />
              Próximos Eventos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events
                .filter((e) => {
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  const eventDate = new Date(e.date + 'T00:00:00')
                  return eventDate >= today
                })
                .slice(0, 6)
                .map((event) => (
                  <div
                    key={event.id}
                    className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-6"
                  >
                    <p className="text-sm text-purple-600 font-semibold mb-2 flex items-center gap-1">
                      <Calendar size={16} />
                      {new Date(event.date + 'T00:00:00').toLocaleDateString('es-ES', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <h4 className="text-lg font-bold text-purple-900 mb-2">
                      {event.title}
                    </h4>
                    <p className="text-gray-700 text-sm line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}