"use client"

import { useEffect } from "react"

interface User {
  id: string
  email: string
  name: string
}

interface GoogleAuthButtonProps {
  onSuccess: (user: User) => void
  onError?: (error: string) => void
}

interface GoogleCredentialResponse {
  credential?: string
}

interface GoogleAccountsId {
  initialize: (options: {
    client_id: string
    callback: (response: GoogleCredentialResponse) => void
  }) => void
  renderButton: (
    parent: HTMLElement,
    options: {
      theme?: string
      size?: string
      text?: string
      shape?: string
      width?: number
    }
  ) => void
}

interface GoogleSDK {
  accounts: {
    id: GoogleAccountsId
  }
}

declare global {
  interface Window {
    google?: GoogleSDK
  }
}


export function GoogleAuthButton({ onSuccess, onError }: GoogleAuthButtonProps) {
  
  useEffect(() => {
    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!
    if (!window.google?.accounts?.id || !GOOGLE_CLIENT_ID) return

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response: GoogleCredentialResponse) => {
        try {
          const { credential } = response
          if (!credential) throw new Error("No Google credential")

          const res = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: credential }), // 👈 CHÍNH XÁC
          })

          const data = await res.json()
          if (!data.success) throw new Error(data.message)

          onSuccess(data.user)
        } catch (err: unknown) {
          console.error("Google login error:", err)
          if (err instanceof Error) {
            onError?.(err.message)
          } else {
            onError?.("Google login failed")
          }
        }
      },
    })

    const container = document.getElementById("google-button")
    if (container) {
      window.google.accounts.id.renderButton(container, {
        theme: "outline",
        size: "large",
        text: "Sign in with",
        shape: "pill",
        width: 150,
      })
    }
  }, [onSuccess, onError])

  return <div id="google-button" className="w-full flex justify-center" />
}