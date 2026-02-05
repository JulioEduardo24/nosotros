import bcrypt from 'bcryptjs'
import { supabase } from './supabase'

export async function registerUser(email: string, password: string) {
  try {
    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (existingUser) {
      throw new Error('El email ya está registrado')
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Guardar usuario
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        password: hashedPassword,
      })
      .select()

    if (error) throw error

    return { success: true, user: data[0] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function loginUser(email: string, password: string) {
  try {
    // Buscar usuario
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      throw new Error('Email o contraseña incorrectos')
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      throw new Error('Email o contraseña incorrectos')
    }

    return { success: true, user: { id: user.id, email: user.email } }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}