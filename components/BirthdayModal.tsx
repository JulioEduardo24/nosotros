'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const CONFETTI_COLORS = [
  'bg-pink-400', 'bg-purple-400', 'bg-yellow-400',
  'bg-blue-400', 'bg-red-400', 'bg-green-400', 'bg-orange-400',
]

const EMOJIS = ['🎂', '🎁', '🎈', '✨', '💖', '🌸', '🎉']

function ConfettiPiece({ index }: { index: number }) {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length]
  const left = `${(index * 7 + 5) % 95}%`
  const delay = `${(index * 0.3) % 3}s`
  const duration = `${2.5 + (index % 3) * 0.7}s`
  const size = index % 3 === 0 ? 'w-3 h-3 rounded-full' : index % 3 === 1 ? 'w-2 h-4 rounded-sm' : 'w-3 h-1 rounded'

  return (
    <div
      className={`absolute top-0 ${size} ${color} opacity-80`}
      style={{
        left,
        animation: `confettiFall ${duration} ${delay} ease-in infinite`,
      }}
    />
  )
}

export default function BirthdayModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    checkBirthdayMessage()
  }, [])

  const checkBirthdayMessage = async () => {
    try {
      const { data, error } = await supabase
        .from('birthday_message')
        .select('*')
        .single()

      if (error) throw error

      if (data?.is_active) {
        setTitle(data.title ?? '¡Feliz Cumpleaños!')
        setMessage(data.message ?? '')
        const shown = sessionStorage.getItem('birthday_shown')
        if (!shown) setIsOpen(true)
      }
    } catch (err) {
      console.error('Error fetching birthday message:', err)
    }
  }

  const handleClose = () => {
    sessionStorage.setItem('birthday_shown', 'true')
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(520px) rotate(720deg); opacity: 0; }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-12px) scale(1.05); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.6; }
        }
        @keyframes popIn {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>

      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
        {/* Confetti container */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}
        </div>

        {/* Modal */}
        <div
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative text-center"
          style={{ animation: 'popIn 0.5s ease-out forwards' }}
        >
          {/* Botón cerrar */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          >
            <X size={22} />
          </button>

          {/* Emoji principal */}
          <div
            className="text-7xl mb-2 select-none"
            style={{ animation: 'floatUp 2.5s ease-in-out infinite' }}
          >
            🎂
          </div>

          {/* Emojis flotantes pequeños */}
          <div className="flex justify-center gap-3 mb-5">
            {EMOJIS.slice(1).map((emoji, i) => (
              <span
                key={i}
                className="text-2xl select-none"
                style={{ animation: `shimmer ${1.2 + i * 0.2}s ease-in-out infinite` }}
              >
                {emoji}
              </span>
            ))}
          </div>

          {/* Título */}
          <h2 className="text-3xl font-extrabold mb-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-lg font-semibold text-pink-400 mb-5">Mi amor 💖</p>

          {/* Mensaje */}
          <p className="text-gray-700 text-base leading-relaxed mb-8 px-2">
            {message}
          </p>

          {/* Botón */}
          <button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-2xl font-bold text-lg hover:opacity-90 transition shadow-lg"
          >
            ¡Gracias!
          </button>
        </div>
      </div>
    </>
  )
}
