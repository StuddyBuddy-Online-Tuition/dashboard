"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useMemo, useState } from "react"
import type { Subject } from "@/types/subject"
import type { Student } from "@/types/student"
import PaginationControls from "@/components/common/pagination"

interface AddStudentsModalProps {
  isOpen: boolean
  onClose: () => void
  subject: Subject
  excludeStudentIds: string[]
  onAddMany: (students: Student[]) => void
}

export default function AddStudentsModal({
  isOpen,
  onClose,
  subject,
  excludeStudentIds,
  onAddMany,
}: AddStudentsModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [students, setStudents] = useState<Student[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("")
      setCurrentPage(1)
      setItemsPerPage(10)
      setSelectedIds(new Set())
    }
  }, [isOpen])

  const totalItems = totalCount
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    setIsLoading(true)
    const params = new URLSearchParams({
      page: String(currentPage),
      pageSize: String(itemsPerPage),
      keyword: debouncedQuery,
    })
    fetch(`/api/subjects/${encodeURIComponent(subject.code)}/available-students?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) {
          const fetched: Student[] = (data.students as Student[]).filter((s) => !excludeStudentIds.includes(s.id))
          setStudents(fetched)
          setTotalCount(Number(data.totalCount ?? 0))
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isOpen, subject.code, currentPage, itemsPerPage, debouncedQuery, excludeStudentIds])

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  const allPageSelected = students.length > 0 && students.every((s) => selectedIds.has(s.id))

  const toggleSelectAllOnPage = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        students.forEach((s) => next.add(s.id))
      } else {
        students.forEach((s) => next.delete(s.id))
      }
      return next
    })
  }

  const toggleRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleAddSelected = () => {
    if (selectedIds.size === 0) return
    const idSet = new Set(selectedIds)
    const selected = students.filter((s) => idSet.has(s.id))
    onAddMany(selected)
    onClose()
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-white">
        <DialogHeader>
          <DialogTitle>Add Students to {subject.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Input
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-secondary/20"
            />
          </div>

          <div className="overflow-x-auto rounded-md border border-secondary/20">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-secondary/10 to-primary/10">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allPageSelected}
                      onCheckedChange={(v) => toggleSelectAllOnPage(Boolean(v))}
                      aria-label="Select all on page"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No available students found.
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((s) => {
                    const isChecked = selectedIds.has(s.id)
                    return (
                      <TableRow key={s.id} className="border-b border-secondary/10 bg-white hover:bg-secondary/5">
                        <TableCell className="w-12">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(v) => toggleRow(s.id, Boolean(v))}
                            aria-label={`Select ${s.name}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="font-mono">{s.studentId}</TableCell>
                        <TableCell>{s.email}</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleAddSelected} disabled={selectedIds.size === 0}>
            Add Selected ({selectedIds.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


