'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Upload, Plane, Heart, Coffee, Zap, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'

const CATEGORIES = [
  { id: 'viajes',              name: 'Viajes',     icon: Plane  },
  { id: 'momentos_especiales', name: 'Especiales', icon: Heart  },
  { id: 'cotidiano',           name: 'Cotidiano',  icon: Coffee },
  { id: 'aventuras',           name: 'Aventuras',  icon: Zap    },
]

export default function UploadPhoto() {
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [category, setCategory] = useState('momentos_especiales')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(f)
    }
  }

  const clearFile = () => { setFile(null); setPreview(null) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !caption) return
    setLoading(true)
    setError('')
    try {
      const userStr = localStorage.getItem('user')
      if (!userStr) throw new Error('No autenticado')
      const user = JSON.parse(userStr)
      const ext = file.name.split('.').pop()
      const filePath = `photos/${user.id}/${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('photos').upload(filePath, file)
      if (uploadErr) throw uploadErr
      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath)
      const { error: dbErr } = await supabase.from('photos').insert({
        user_id: user.id,
        image_url: publicUrl,
        caption,
        category,
      })
      if (dbErr) throw dbErr
      router.push('/gallery')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link href="/gallery">
            <Button variant="ghost" size="sm" className="gap-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] -ml-2">
              <ArrowLeft size={16} />
              Volver
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-10 animate-fade-in">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[hsl(var(--foreground))]">Subir foto</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
            Agrega un nuevo recuerdo a la galeria
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Foto */}
              <div className="space-y-2">
                <Label>Foto</Label>
                {!preview ? (
                  <label
                    htmlFor="file-input"
                    className="flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed border-[hsl(var(--border))] cursor-pointer hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary)/0.5)] transition-colors"
                  >
                    <Upload size={24} className="text-[hsl(var(--muted-foreground))] mb-2" />
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      Haz clic para seleccionar
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                      JPG, PNG, WebP
                    </p>
                    <input
                      id="file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full max-h-64 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={clearFile}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Descripcion */}
              <div className="space-y-1.5">
                <Label htmlFor="caption">Descripcion *</Label>
                <Textarea
                  id="caption"
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Que hace especial esta foto..."
                  className="h-24"
                />
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label>Categoria</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(cat => {
                    const Icon = cat.icon
                    const active = category === cat.id
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={[
                          'flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors',
                          active
                            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]'
                            : 'border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]',
                        ].join(' ')}
                      >
                        <Icon size={16} />
                        {cat.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {error && (
                <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <Link href="/gallery" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancelar
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading || !file || !caption}
                >
                  {loading ? 'Subiendo...' : 'Guardar foto'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
