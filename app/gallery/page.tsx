'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2, Plus, Images, Plane, Heart, Coffee, Zap } from 'lucide-react'

interface Photo {
  id: string
  image_url: string
  caption: string
  category: string
  created_at: string
  user_id: string
}

const categories = [
  { id: 'viajes', name: 'Viajes', icon: Plane },
  { id: 'momentos_especiales', name: 'Momentos Especiales', icon: Heart },
  { id: 'cotidiano', name: 'Cotidiano', icon: Coffee },
  { id: 'aventuras', name: 'Aventuras', icon: Zap },
]

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([])
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        router.push('/')
      } else {
        const user = JSON.parse(userStr)
        setUser(user) 
        await fetchPhotos()
      }
      setLoading(false) 
    }
    checkAuth()
  }, [router])

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPhotos(data || [])
    } catch (err) {
      console.error('Error fetching photos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedCategory === 'todos') {
      setFilteredPhotos(photos)
    } else {
      setFilteredPhotos(photos.filter((p) => p.category === selectedCategory))
    }
  }, [photos, selectedCategory])

  const handleDelete = async (photoId: string) => {
    if (!confirm('¿Estás seguro?')) return

    try {
      const { error } = await supabase.from('photos').delete().eq('id', photoId)
      if (error) throw error
      setPhotos(photos.filter((p) => p.id !== photoId))
    } catch (err) {
      console.error('Error deleting photo:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <Images size={60} className="text-purple-600 animate-bounce" />
      </div>
    )
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
            <Images size={32} className="text-purple-600" />
            Nuestra Galería
          </h1>
          <Link href="/gallery/upload">
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition">
              <Plus size={20} />
              Subir Foto
            </button>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-3 overflow-x-auto pb-4">
          <button
            onClick={() => setSelectedCategory('todos')}
            className={`px-6 py-2 rounded-full whitespace-nowrap font-semibold transition flex items-center gap-2 ${
              selectedCategory === 'todos'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-purple-100'
            }`}
          >
            <Images size={18} />
            Todas
          </button>
          {categories.map((cat) => {
            const IconComponent = cat.icon
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2 rounded-full whitespace-nowrap font-semibold transition flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-purple-100'
                }`}
              >
                <IconComponent size={18} />
                {cat.name}
              </button>
            )
          })}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 pb-12">
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-12">
            <Images size={80} className="mx-auto text-purple-300 mb-4" />
            <p className="text-gray-600 text-lg">
              No hay fotos. ¡Sube la primera!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:scale-105 cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="relative h-64 overflow-hidden bg-purple-100">
                  <img
                    src={photo.image_url}
                    alt={photo.caption}
                    className="w-full h-full object-cover hover:scale-110 transition"
                  />
                </div>

                <div className="p-4">
                  <p className="text-sm text-purple-600 font-semibold mb-2 flex items-center gap-1">
                    {(() => {
                      const cat = categories.find((c) => c.id === photo.category)
                      if (!cat) return null
                      const IconComponent = cat.icon
                      return (
                        <>
                          <IconComponent size={16} />
                          {cat.name}
                        </>
                      )
                    })()}
                  </p>
                  <p className="text-gray-800 font-semibold mb-2 line-clamp-2">
                    {photo.caption}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(photo.created_at).toLocaleDateString('es-ES')}
                  </p>

                  {user?.id === photo.user_id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(photo.id)
                      }}
                      className="mt-3 w-full bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 transition flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.image_url}
              alt={selectedPhoto.caption}
              className="w-full max-h-96 object-cover"
            />
            <div className="p-6">
              <p className="text-sm text-purple-600 font-semibold mb-2 flex items-center gap-1">
                {(() => {
                  const cat = categories.find((c) => c.id === selectedPhoto.category)
                  if (!cat) return null
                  const IconComponent = cat.icon
                  return (
                    <>
                      <IconComponent size={16} />
                      {cat.name}
                    </>
                  )
                })()}
              </p>
              <p className="text-2xl font-bold text-gray-800 mb-2">
                {selectedPhoto.caption}
              </p>
              <p className="text-gray-600">
                {new Date(selectedPhoto.created_at).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}