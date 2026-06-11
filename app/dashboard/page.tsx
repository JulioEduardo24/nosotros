'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, ImageIcon, CalendarDays, Plus, ArrowRight, ListChecks } from 'lucide-react'
import ValentineModal from '@/components/ValentineModal'
import BirthdayModal from '@/components/BirthdayModal'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { getDaysUntilNext29, getDaysUntil, getPeruToday } from '@/lib/date-utils'
import { supabase } from '@/lib/supabase'

function getNameFromEmail(email: string): string {
  const local = email.split('@')[0]
  return local.charAt(0).toUpperCase() + local.slice(1).split(/[._]/)[0]
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [nextEvent, setNextEvent] = useState<{ title: string; date: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/')
      return
    }
    setUser(JSON.parse(userStr))
    fetchNextEvent()
    setLoading(false)
  }, [router])

  const fetchNextEvent = async () => {
    try {
      const today = getPeruToday()
      const { data } = await supabase
        .from('events')
        .select('title, date')
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(1)
        .single()
      if (data) setNextEvent(data)
    } catch {
      // no events
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent animate-spin" />
      </div>
    )
  }

  const name = user?.email ? getNameFromEmail(user.email) : 'tu'
  const daysUntil29 = getDaysUntilNext29()
  const daysUntilNext = nextEvent ? getDaysUntil(nextEvent.date) : null

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="max-w-4xl mx-auto px-5 py-3 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            nosotros
          </span>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              <LogOut size={15} />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-10 space-y-8 animate-fade-in">
        <ValentineModal />
        <BirthdayModal />

        {/* Saludo + contadores */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
              Hola, {name}
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] mt-1 text-sm">
              Aqui estan tus recuerdos y eventos
            </p>
          </div>

          {/* Contadores */}
          <div className="flex gap-3">
            {/* Proximo evento */}
            <div className="w-[110px] text-center px-4 py-3 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
              <p className="text-2xl font-bold text-[hsl(var(--primary))] leading-none">
                {nextEvent ? (daysUntilNext ?? 0) : '-'}
              </p>
              {nextEvent ? (
                <>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1.5 leading-none">dias para</p>
                  <p className="text-[11px] font-medium text-[hsl(var(--foreground))] mt-0.5 truncate leading-tight" title={nextEvent.title}>
                    {nextEvent.title}
                  </p>
                </>
              ) : (
                <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1.5">sin eventos</p>
              )}
            </div>
            {/* Mensiversario */}
            <div className="w-[110px] text-center px-4 py-3 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
              <p className="text-2xl font-bold text-[hsl(var(--foreground))] leading-none">
                {daysUntil29 === 0 ? '0' : daysUntil29}
              </p>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1.5 leading-tight">
                {daysUntil29 === 0 ? 'mensiversario hoy' : 'dias para el 29'}
              </p>
            </div>
          </div>
        </div>

        {/* Tarjetas de navegacion */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/gallery" className="group block">
            <Card className="h-full transition-shadow duration-200 group-hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="w-9 h-9 rounded-lg bg-[hsl(var(--secondary))] flex items-center justify-center mb-2 transition-colors group-hover:bg-[hsl(var(--primary)/0.12)]">
                  <ImageIcon size={18} className="text-[hsl(var(--primary))]" />
                </div>
                <CardTitle className="text-sm">Galeria</CardTitle>
                <CardDescription className="text-xs">
                  Fotos y recuerdos compartidos
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-0">
                <span className="text-xs font-medium text-[hsl(var(--primary))] flex items-center gap-1 group-hover:gap-2 transition-all">
                  Ver galeria <ArrowRight size={11} />
                </span>
              </CardFooter>
            </Card>
          </Link>

          <Link href="/calendar" className="group block">
            <Card className="h-full transition-shadow duration-200 group-hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="w-9 h-9 rounded-lg bg-[hsl(var(--secondary))] flex items-center justify-center mb-2 transition-colors group-hover:bg-[hsl(var(--primary)/0.12)]">
                  <CalendarDays size={18} className="text-[hsl(var(--primary))]" />
                </div>
                <CardTitle className="text-sm">Eventos</CardTitle>
                <CardDescription className="text-xs">
                  Fechas especiales y citas
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-0">
                <span className="text-xs font-medium text-[hsl(var(--primary))] flex items-center gap-1 group-hover:gap-2 transition-all">
                  Ver eventos <ArrowRight size={11} />
                </span>
              </CardFooter>
            </Card>
          </Link>

          <Link href="/bucket-list" className="group block">
            <Card className="h-full transition-shadow duration-200 group-hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="w-9 h-9 rounded-lg bg-[hsl(var(--secondary))] flex items-center justify-center mb-2 transition-colors group-hover:bg-[hsl(var(--primary)/0.12)]">
                  <ListChecks size={18} className="text-[hsl(var(--primary))]" />
                </div>
                <CardTitle className="text-sm">Lista de planes</CardTitle>
                <CardDescription className="text-xs">
                  Cosas por hacer juntos
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-0">
                <span className="text-xs font-medium text-[hsl(var(--primary))] flex items-center gap-1 group-hover:gap-2 transition-all">
                  Ver lista <ArrowRight size={11} />
                </span>
              </CardFooter>
            </Card>
          </Link>
        </div>

        <Separator />

        <div>
          <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-3">Agregar</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/gallery/upload">
              <Button className="gap-2" size="sm">
                <Plus size={14} />
                Nueva foto
              </Button>
            </Link>
            <Link href="/calendar/add-event">
              <Button variant="outline" className="gap-2" size="sm">
                <Plus size={14} />
                Nuevo evento
              </Button>
            </Link>
            <Link href="/bucket-list">
              <Button variant="outline" className="gap-2" size="sm">
                <Plus size={14} />
                Nuevo plan
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
