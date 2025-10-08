"use client"

import type React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { UserX } from "lucide-react"

interface RemoveStudentConfirmProps {
  triggerVariant?: "ghost" | "default" | "outline" | "secondary" | "destructive"
  triggerClassName?: string
  studentName: string
  onConfirm: () => void
  children?: React.ReactNode
}

export function RemoveStudentConfirm({
  triggerVariant = "ghost",
  triggerClassName,
  studentName,
  onConfirm,
  children,
}: RemoveStudentConfirmProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button variant={triggerVariant} size="sm" className={triggerClassName}>
            <UserX className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove student?</AlertDialogTitle>
          <AlertDialogDescription>
            This will mark {studentName} as removed. You can find removed students in the Removed Students view.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}


