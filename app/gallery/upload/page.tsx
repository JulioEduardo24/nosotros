'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Upload, MessageCircle, Sparkles, Plane, Heart, Coffee, Zap } from 'lucide-react'
import Link from 'next/link'

const categories = [
  { id: 'viajes', name: 'Viajes', icon: Plane },
  { id: 'momentos_especiales', name: 'Momentos Especiales', icon: Heart },
  { id: 'cotidiano', name: 'Cotidiano', icon: Coffee },
  { id: 'aventuras', name: 'Aventuras', icon: Zap },
]

export default function UploadPhoto() {
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [category, setCategory] = useState('momentos_especiales')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !caption) {
      alert('Por favor completa todos los campos')
      return
    }

    setLoading(true)

    try {
      console.log('PASO 1: Obteniendo usuario')
      const userStr = localStorage.getItem('user')
      if (!userStr) throw new Error('No authenticated')
      const user = JSON.parse(userStr)
      console.log('Usuario:', user)

      console.log('PASO 2: Subiendo a Storage')
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `photos/${user.id}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file)

      console.log('Upload error:', uploadError, 'Upload data:', uploadData)
      if (uploadError) throw uploadError

      console.log('PASO 3: Obteniendo URL pública')
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath)

      console.log('URL pública:', publicUrl)

      console.log('PASO 4: Insertando en BD')
      const { error: dbError, data: dbData } = await supabase.from('photos').insert({
        user_id: user.id,
        image_url: publicUrl,
        caption,
        category,
      })

      console.log('DB error:', dbError, 'DB data:', dbData)
      if (dbError) throw dbError

      alert('¡Foto subida exitosamente!')
      router.push('/gallery')
    } catch (err: any) {
      console.error('Error completo:', err)
      alert(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <header className="bg-white shadow-md">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <Link href="/gallery" className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft size={24} />
            <span className="font-semibold">Volver a Galería</span>
          </Link>
          <h1 className="text-3xl font-bold text-purple-700 flex items-center gap-2">
            <Upload size={32} className="text-purple-600" />
            Subir Nueva Foto
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-4">
                Selecciona una foto
              </label>
              {!preview ? (
                <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center hover:border-purple-500 transition cursor-pointer bg-purple-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="cursor-pointer">
                    <Upload className="mx-auto text-purple-400 mb-4" size={48} />
                    <p className="text-gray-700 font-semibold mb-2">
                      Arrastra tu foto aquí o haz click
                    </p>
                    <p className="text-gray-500 text-sm">
                      JPG, PNG, WebP
                    </p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full max-h-96 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null)
                      setPreview(null)
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2"
                  >
                    Cambiar foto
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MessageCircle size={20} className="text-purple-600" />
                Cuéntale una historia a esta foto
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Cuéntame qué hace especial esta foto..."
                className="w-full px-4 py-3 rounded-lg border-2 border-purple-200 focus:outline-none focus:border-purple-500 resize-none h-32"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                ¿En qué categoría va?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => {
                  const IconComponent = cat.icon
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-4 rounded-lg font-semibold transition flex items-center gap-2 justify-center ${
                        category === cat.id
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                      }`}
                    >
                      <IconComponent size={20} />
                      {cat.name}
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !file || !caption}
              className="w-full bg-purple-600 text-white font-bold py-4 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  ⏳ Subiendo...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Guardar Foto
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}