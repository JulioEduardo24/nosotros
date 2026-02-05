'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Calendar, MessageCircle, Clock, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function AddEvent() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !date) {
      alert('Por favor completa los campos requeridos')
      return
    }

    setLoading(true)

    try {
      const userStr = localStorage.getItem('user')
      if (!userStr) throw new Error('No authenticated')
      const user = JSON.parse(userStr)
      console.log('User:', user) 
      const { error } = await supabase.from('events').insert({
        user_id: user.id,
        title,
        description,
        date,
        time: time || null,
      })

      if (error) throw error

      alert('¡Evento creado exitosamente!')
      router.push('/calendar')
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <header className="bg-white shadow-md">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <Link href="/calendar" className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft size={24} />
            <span className="font-semibold">Volver al Calendario</span>
          </Link>
          <h1 className="text-3xl font-bold text-purple-700 flex items-center gap-2">
            <Calendar size={32} className="text-purple-600" />
            Crear Nuevo Evento
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                ¿Qué evento es? *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Aniversario"
                className="w-full px-4 py-3 rounded-lg border-2 border-purple-200 focus:outline-none focus:border-purple-500 text-lg"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MessageCircle size={20} className="text-purple-600" />
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="¿Qué haremos en este evento?"
                className="w-full px-4 py-3 rounded-lg border-2 border-purple-200 focus:outline-none focus:border-purple-500 resize-none h-32"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar size={20} className="text-purple-600" />
                  Fecha *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-purple-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Clock size={20} className="text-purple-600" />
                  Hora
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-purple-200 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !title || !date}
              className="w-full bg-purple-600 text-white font-bold py-4 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  ⏳ Guardando...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Guardar Evento
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}