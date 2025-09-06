"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { DollarSign, Calendar, CreditCard } from "lucide-react"
import type { Student } from "@/types/student"

interface FinanceModalProps {
  student: Student
  onClose: () => void
  onSave: (student: Student) => void
}

export default function FinanceModal({ student, onClose, onSave }: FinanceModalProps) {
  const [formData, setFormData] = useState<Student>(student)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRecurringPaymentChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, recurringPayment: checked }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleRecordPayment = () => {
    const today = new Date()
    const nextMonth = new Date(today)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    setFormData((prev) => ({
      ...prev,
      lastPaymentMadeDate: today.toISOString().split("T")[0],
      nextRecurringPaymentDate: nextMonth.toISOString().split("T")[0],
    }))
  }

  const getPaidStatus = (lastPaymentDate: string) => {
    const currentDate = new Date()
    const paymentDate = new Date(lastPaymentDate)

    const isCurrentMonth =
      paymentDate.getMonth() === currentDate.getMonth() && paymentDate.getFullYear() === currentDate.getFullYear()

    return isCurrentMonth ? "Paid" : "No"
  }

  const getPaidStatusColor = (status: string) => {
    return status === "Paid" ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300"
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("S")) {
      return "bg-green-100 text-green-800 border-green-300"
    } else if (grade.startsWith("F")) {
      return "bg-blue-100 text-blue-800 border-blue-300"
    } else if (grade === "CP") {
      return "bg-purple-100 text-purple-800 border-purple-300"
    }
    return "bg-gray-100 text-gray-800 border-gray-300"
  }

  const getModeColor = (mode: string) => {
    return (
      {
        "NORMAL": "bg-gray-100 text-gray-800 border-gray-300",
        "1 TO 1": "bg-orange-100 text-orange-800 border-orange-300",
        "OTHERS": "bg-slate-100 text-slate-800 border-slate-300",
      } as Record<string, string>
    )[mode] || "bg-gray-100 text-gray-800 border-gray-300"
  }

  const currentPaidStatus = getPaidStatus(formData.lastPaymentMadeDate)

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] p-4 rounded-lg sm:w-auto sm:max-w-[600px] sm:p-6 border-secondary/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-green-100 to-blue-100 -mx-4 -mt-4 px-4 py-3 rounded-t-lg">
          <DialogTitle className="text-navy flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Payment Management - {student.name}
          </DialogTitle>
        </DialogHeader>

        {/* Student Info Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-medium text-navy">Student:</span>
            <span className="font-mono text-sm bg-white px-2 py-1 rounded">{student.studentId}</span>
            <Badge className={getGradeColor(student.grade)}>{student.grade}</Badge>
            {student.modes.map((m) => (
              <Badge key={m} className={getModeColor(m)}>{m}</Badge>
            ))}
            <Badge className={getPaidStatusColor(currentPaidStatus)}>{currentPaidStatus}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">School:</span> {student.school}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Payment Status Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <h3 className="font-medium text-navy">Payment Status</h3>
              </div>

              {/* Current Status Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <Label className="text-sm text-muted-foreground">Current Status</Label>
                  <div className="mt-1">
                    <Badge className={getPaidStatusColor(currentPaidStatus)} size="lg">
                      {currentPaidStatus}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Quick Action</Label>
                  <div className="mt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRecordPayment}
                      className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                    >
                      Record Payment Today
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Dates Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <h3 className="font-medium text-navy">Payment Dates</h3>
              </div>

              {/* Last Payment Date */}
              <div className="space-y-3">
                <Label htmlFor="lastPaymentMadeDate" className="text-navy font-medium">
                  Last Payment Date
                </Label>
                <div className="relative">
                  <Input
                    id="lastPaymentMadeDate"
                    name="lastPaymentMadeDate"
                    type="date"
                    value={formData.lastPaymentMadeDate}
                    onChange={handleChange}
                    className="w-full border-secondary/20 rounded-lg px-4 py-3 pr-12 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:h-4 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Next Payment Date */}
              <div className="space-y-3">
                <Label htmlFor="nextRecurringPaymentDate" className="text-navy font-medium">
                  Next Payment Date
                </Label>
                <div className="relative">
                  <Input
                    id="nextRecurringPaymentDate"
                    name="nextRecurringPaymentDate"
                    type="date"
                    value={formData.nextRecurringPaymentDate}
                    onChange={handleChange}
                    className="w-full border-secondary/20 rounded-lg px-4 py-3 pr-12 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:h-4 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recurring Payment Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <h3 className="font-medium text-navy">Recurring Payment Settings</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="recurringPayment" className="text-navy sm:text-right">
                  Recurring Payment
                </Label>
                <div className="sm:col-span-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="recurringPayment"
                      checked={formData.recurringPayment}
                      onCheckedChange={handleRecurringPaymentChange}
                    />
                    <Label htmlFor="recurringPayment" className="text-sm">
                      {formData.recurringPayment ? "Enabled" : "Disabled"}
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge
                      className={
                        formData.recurringPayment
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : "bg-gray-100 text-gray-800 border-gray-300"
                      }
                    >
                      {formData.recurringPayment ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment History Preview */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <h3 className="font-medium text-navy">Payment Summary</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Last Payment</p>
                  <p className="font-medium text-navy">
                    {new Date(formData.lastPaymentMadeDate).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Next Payment</p>
                  <p className="font-medium text-navy">
                    {new Date(formData.nextRecurringPaymentDate).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Recurring</p>
                  <p className="font-medium text-navy">{formData.recurringPayment ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col space-y-2 mt-6 sm:flex-row sm:space-y-0 sm:mt-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full h-11 sm:w-auto sm:h-auto border-secondary/20 text-navy hover:bg-secondary/10 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full h-11 sm:w-auto sm:h-auto bg-green-600 text-white hover:bg-green-700"
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Update Payment Info
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
