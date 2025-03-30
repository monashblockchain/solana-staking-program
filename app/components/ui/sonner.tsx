"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group rounded-xl border-[#3a1f7a]/30 bg-[#1a1a2e] text-white shadow-lg",
          title: "text-white font-medium",
          description: "text-gray-300",
          success: "!bg-gradient-to-r !from-green-500/10 !to-emerald-600/10 !border-green-500/20",
          error: "!bg-gradient-to-r !from-red-500/10 !to-rose-600/10 !border-red-500/20",
          info: "!bg-gradient-to-r !from-blue-500/10 !to-indigo-600/10 !border-blue-500/20",
        }
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "rgba(34, 197, 94, 0.1)",
          "--success-text": "#22c55e",
          "--success-border": "rgba(34, 197, 94, 0.2)",
          "--error-bg": "rgba(239, 68, 68, 0.1)",
          "--error-text": "#ef4444",
          "--error-border": "rgba(239, 68, 68, 0.2)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
