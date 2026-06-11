'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2, Plus, X, Plane, Heart, Coffee, Zap, Images } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { formatDateES } from '@/lib/date-utils'

interface Photo {
  id: string
  image_url: string
  caption: string
  category: string
  created_at: string
  user_id: string
}

const CATEGORIES = [
  { id: 'todos',               name: 'Todas',             icon: Images },
  { id: 'viajes',              name: 'Viajes',            icon: Plane },
  { id: 'momentos_especiales', name: 'Especiales',        icon: Heart },
  { id: 'cotidiano',           name: 'Cotidiano',         icon: Coffee },
  { id: 'aventuras',           name: 'Aventuras',         icon: Zap },
]

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) { router.push('/'); return }
    setUser(JSON.parse(userStr))
    fetchPhotos()
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
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (photoId: string) => {
    if (!confirm('Eliminar esta foto?')) return
    try {
      const { error } = await supabase.from('photos').delete().eq('id', photoId)
      if (error) throw error
      setPhotos(prev => prev.filter(p => p.id !== photoId))
      setSelectedPhoto(null)
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = selectedCategory === 'todos'
    ? photos
    : photos.filter(p => p.category === selectedCategory)

  const catName = (id: string) => CATEGORIES.find(c => c.id === id)?.name ?? id

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] -ml-2">
              <ArrowLeft size={16} />
              Volver
            </Button>
          </Link>
          <span className="text-sm font-semibold text-[hsl(var(--foreground))]">Galeria</span>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link href="/gallery/upload">
              <Button size="sm" className="gap-1.5">
                <Plus size={14} />
                Subir
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="max-w-5xl mx-auto px-5 py-2 flex gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon
            const active = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                  active
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]',
                ].join(' ')}
              >
                <Icon size={12} />
                {cat.name}
              </button>
            )
          })}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-5 py-6 animate-fade-in">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Images size={40} className="mx-auto text-[hsl(var(--muted-foreground))] mb-3 opacity-40" />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {selectedCategory === 'todos' ? 'Aun no hay fotos' : 'No hay fotos en esta categoria'}
            </p>
            <Link href="/gallery/upload" className="mt-4 inline-block">
              <Button size="sm" variant="outline" className="gap-1.5 mt-3">
                <Plus size={14} />
                Subir primera foto
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map(photo => (
              <button
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group relative aspect-square overflow-hidden rounded-lg bg-[hsl(var(--muted))] text-left"
              >
                <img
                  src={photo.image_url}
                  alt={photo.caption}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-end">
                  <div className="p-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 w-full">
                    <p className="text-white text-xs font-medium line-clamp-2 leading-snug">
                      {photo.caption}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-[hsl(var(--card))] rounded-xl overflow-hidden max-w-lg w-full shadow-2xl animate-pop-in"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.image_url}
              alt={selectedPhoto.caption}
              className="w-full max-h-80 object-cover"
            />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium text-[hsl(var(--primary))] mb-1">
                    {catName(selectedPhoto.category)}
                  </p>
                  <p className="font-semibold text-[hsl(var(--foreground))] leading-snug">
                    {selectedPhoto.caption}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1.5">
                    {new Date(selectedPhoto.created_at).toLocaleDateString('es-PE', {
                      timeZone: 'America/Lima',
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {user?.id === selectedPhoto.user_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]"
                      onClick={() => handleDelete(selectedPhoto.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[hsl(var(--muted-foreground))]"
                    onClick={() => setSelectedPhoto(null)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
