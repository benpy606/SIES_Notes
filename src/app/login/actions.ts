'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function login(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return NextResponse.redirect(new URL('/login?error=' + encodeURIComponent(error.message), process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
  }

  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
}

export async function signup(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return NextResponse.redirect(new URL('/login?error=' + encodeURIComponent(error.message), process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
  }

  return NextResponse.redirect(new URL('/login?message=check+your+email+for+confirmation', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
}
