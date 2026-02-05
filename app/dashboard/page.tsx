'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Image, Calendar, Plus, Heart, Users } from 'lucide-react'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/')
    } else {
      setUser(JSON.parse(userStr))
    }
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <div className="text-3xl animate-bounce">🐱</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <header className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-purple-700">Nosotros 💜</h1>
            <p className="text-gray-600">Bienvenido, {user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            <LogOut size={20} />
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Link href="/gallery">
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition transform hover:scale-105 cursor-pointer">
              <div className="text-6xl mb-4 text-purple-600">
                <Image size={80} />
              </div>
              <h2 className="text-2xl font-bold text-purple-700 mb-2">Galería</h2>
              <p className="text-gray-600 mb-4">
                Nuestras fotos más bonitas con historias
              </p>
              <div className="flex items-center text-purple-600 font-semibold">
                Ver galería →
              </div>
            </div>
          </Link>

          <Link href="/calendar">
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition transform hover:scale-105 cursor-pointer">
              <div className="text-6xl mb-4 text-purple-600">
                <Calendar size={80} />
              </div>
              <h2 className="text-2xl font-bold text-purple-700 mb-2">Eventos</h2>
              <p className="text-gray-600 mb-4">
                Nuestras citas especiales
              </p>
              <div className="flex items-center text-purple-600 font-semibold">
                Ver eventos →
              </div>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-purple-700 mb-6">Agregar Contenido</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/gallery/upload">
              <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2">
                <Plus size={20} />
                Subir Foto
              </button>
            </Link>
            <Link href="/calendar/add-event">
              <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2">
                <Plus size={20} />
                Agregar Evento
              </button>
            </Link>
          </div>
        </div>

        
      </main>
    </div>
  )
}