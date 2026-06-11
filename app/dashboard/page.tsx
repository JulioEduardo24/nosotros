'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, ImageIcon, CalendarDays, Plus, ArrowRight } from 'lucide-react'
import ValentineModal from '@/components/ValentineModal'
import BirthdayModal from '@/components/BirthdayModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'

function getNameFromEmail(email: string): string {
  const local = email.split('@')[0]
  return local.charAt(0).toUpperCase() + local.slice(1).split(/[._]/)[0]
}

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
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent animate-spin" />
      </div>
    )
  }

  const name = user?.email ? getNameFromEmail(user.email) : 'tu'

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

      <main className="max-w-4xl mx-auto px-5 py-10 space-y-10 animate-fade-in">
        <ValentineModal />
        <BirthdayModal />

        <div>
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            Hola, {name}
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] mt-1 text-sm">
            Aqui estan tus recuerdos y eventos
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/gallery" className="group block">
            <Card className="h-full transition-shadow duration-200 group-hover:shadow-md">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--secondary))] flex items-center justify-center mb-2 transition-colors group-hover:bg-[hsl(var(--primary)/0.12)]">
                  <ImageIcon size={20} className="text-[hsl(var(--primary))]" />
                </div>
                <CardTitle className="text-base">Galeria</CardTitle>
                <CardDescription className="text-sm">
                  Fotos y recuerdos compartidos
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <span className="text-xs font-medium text-[hsl(var(--primary))] flex items-center gap-1 group-hover:gap-2 transition-all">
                  Ver galeria <ArrowRight size={12} />
                </span>
              </CardFooter>
            </Card>
          </Link>

          <Link href="/calendar" className="group block">
            <Card className="h-full transition-shadow duration-200 group-hover:shadow-md">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--secondary))] flex items-center justify-center mb-2 transition-colors group-hover:bg-[hsl(var(--primary)/0.12)]">
                  <CalendarDays size={20} className="text-[hsl(var(--primary))]" />
                </div>
                <CardTitle className="text-base">Eventos</CardTitle>
                <CardDescription className="text-sm">
                  Fechas especiales y citas
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <span className="text-xs font-medium text-[hsl(var(--primary))] flex items-center gap-1 group-hover:gap-2 transition-all">
                  Ver eventos <ArrowRight size={12} />
                </span>
              </CardFooter>
            </Card>
          </Link>
        </div>

        <Separator />

        <div>
          <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-3">Agregar</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/gallery/upload">
              <Button className="gap-2 w-full sm:w-auto">
                <Plus size={16} />
                Nueva foto
              </Button>
            </Link>
            <Link href="/calendar/add-event">
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <Plus size={16} />
                Nuevo evento
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
