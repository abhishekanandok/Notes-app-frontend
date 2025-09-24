"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  const getIcon = (variant?: string | null) => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-800 dark:text-green-400" />
      case "destructive":
        return <XCircle className="h-5 w-5 text-destructive dark:text-destructive" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-700 dark:text-yellow-400" />
      case "info":
        return <Info className="h-5 w-5 text-blue-700 dark:text-blue-400" />
      default:
        return <Info className="h-5 w-5 text-foreground/60" />
    }
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(variant)}
              </div>
              <div className="grid gap-1 flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
