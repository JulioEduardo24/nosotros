'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Heart } from 'lucide-react'

export default function ValentineModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    checkValentineMessage()
  }, [])

  const checkValentineMessage = async () => {
    try {
      const { data, error } = await supabase
        .from('valentine_message')
        .select('*')
        .single()

      if (error) throw error

      if (data && data.is_active) {
        setMessage(data.message)
        setIsActive(true)
        setIsOpen(true)
      }
    } catch (err) {
      console.error('Error fetching valentine message:', err)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  if (!isOpen || !isActive) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        {/* Corazones animados */}
        <div className="flex justify-center gap-4 mb-6">
          <Heart size={40} className="text-red-500 animate-bounce fill-black-500" />
          <Heart size={50} className="text-pink-500 animate-bounce fill-black-500" style={{ animationDelay: '0.2s' }} />
          <Heart size={40} className="text-red-500 animate-bounce fill-black-500" style={{ animationDelay: '0.4s' }} />
        </div>

        {/* Mensaje */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text mb-4">
            San Valentín
          </h2>
          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            {message}
          </p>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
            >
              Cerrar
            </button>
            <button
              onClick={handleClose}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
            >
              ¡Sí!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}