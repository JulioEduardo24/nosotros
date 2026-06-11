'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ValentineModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    checkMessage()
  }, [])

  const checkMessage = async () => {
    try {
      const { data, error } = await supabase
        .from('valentine_message')
        .select('*')
        .single()
      if (error) throw error
      if (data?.is_active) {
        setMessage(data.message)
        setIsOpen(true)
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-[hsl(var(--card))] rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center relative animate-pop-in">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex justify-center gap-3 mb-5">
          <Heart size={24} className="text-rose-500 fill-rose-500 animate-bounce" style={{ animationDelay: '0s' }} />
          <Heart size={32} className="text-rose-400 fill-rose-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
          <Heart size={24} className="text-rose-500 fill-rose-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
        </div>

        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">
          San Valentin
        </h2>

        <p className="text-[hsl(var(--foreground))] text-sm leading-relaxed mb-6 px-2">
          {message}
        </p>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
            Cerrar
          </Button>
          <Button className="flex-1" onClick={() => setIsOpen(false)}>
            Si
          </Button>
        </div>
      </div>
    </div>
  )
}
