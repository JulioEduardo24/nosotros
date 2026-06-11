'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

const CONFETTI_COLORS = [
  'bg-rose-400', 'bg-purple-400', 'bg-pink-400',
  'bg-violet-400', 'bg-fuchsia-400', 'bg-rose-300', 'bg-purple-300',
]

function ConfettiPiece({ index }: { index: number }) {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length]
  const left = `${(index * 7 + 5) % 95}%`
  const duration = `${2.5 + (index % 3) * 0.7}s`
  const delay = `${(index * 0.3) % 3}s`
  const shape = index % 3 === 0 ? 'w-2 h-2 rounded-full' : index % 3 === 1 ? 'w-1.5 h-3 rounded-sm' : 'w-3 h-1 rounded'
  return (
    <div
      className={`absolute top-0 ${shape} ${color} opacity-80 animate-confetti`}
      style={{ left, '--duration': duration, '--delay': delay } as React.CSSProperties}
    />
  )
}

export default function BirthdayModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    checkMessage()
  }, [])

  const checkMessage = async () => {
    try {
      const { data, error } = await supabase
        .from('birthday_message')
        .select('*')
        .single()
      if (error) throw error
      if (data?.is_active) {
        setTitle(data.title ?? 'Feliz Cumpleanos')
        setMessage(data.message ?? '')
        if (!sessionStorage.getItem('birthday_shown')) setIsOpen(true)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleClose = () => {
    sessionStorage.setItem('birthday_shown', 'true')
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <ConfettiPiece key={i} index={i} />
        ))}
      </div>

      <div className="bg-[hsl(var(--card))] rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center relative animate-pop-in">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <X size={18} />
        </button>

        <div className="w-16 h-16 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center mx-auto mb-4 animate-float">
          <span className="text-3xl" aria-hidden>🎂</span>
        </div>

        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-1">
          {title}
        </h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">Para ti</p>

        <p className="text-[hsl(var(--foreground))] text-sm leading-relaxed mb-6 px-2">
          {message}
        </p>

        <Button onClick={handleClose} className="w-full">
          Gracias
        </Button>
      </div>
    </div>
  )
}
