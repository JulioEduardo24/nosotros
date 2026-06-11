'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'

export default function AddEvent() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !date) return
    setLoading(true)
    setError('')
    try {
      const userStr = localStorage.getItem('user')
      if (!userStr) throw new Error('No autenticado')
      const user = JSON.parse(userStr)
      const { error } = await supabase.from('events').insert({
        user_id: user.id,
        title,
        description,
        date,
        time: time || null,
      })
      if (error) throw error
      router.push('/calendar')
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
          <Link href="/calendar">
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
          <h1 className="text-xl font-semibold text-[hsl(var(--foreground))]">Nuevo evento</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
            Guarda una fecha especial
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="title">Titulo *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ej: Aniversario"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Descripcion</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Que haremos ese dia..."
                  className="h-28"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="date">Fecha *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="time">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <Link href="/calendar" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancelar
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading || !title || !date}
                >
                  {loading ? 'Guardando...' : 'Guardar evento'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
