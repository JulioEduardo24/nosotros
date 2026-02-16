'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Heart } from 'lucide-react'

export default function ValentineToggle() {
  const [isActive, setIsActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [messageId, setMessageId] = useState<string | null>(null)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('valentine_message')
        .select('id, is_active')
        .single()

      if (error) throw error
      setMessageId(data.id)
      setIsActive(data.is_active)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const toggleMessage = async () => {
    if (!messageId) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('valentine_message')
        .update({ is_active: !isActive })
        .eq('id', messageId)

      if (error) throw error
      setIsActive(!isActive)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Heart size={24} className="text-red-500 fill-red-500" />
        <span className="text-gray-700 font-semibold">
          {isActive ? 'Mensaje activado 💕' : 'Mensaje desactivado'}
        </span>
      </div>

      <button
        onClick={toggleMessage}
        disabled={loading}
        className={`px-6 py-2 rounded-lg font-semibold transition ${
          isActive
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {isActive ? 'Desactivar' : 'Activar'}
      </button>
    </div>
  )
}