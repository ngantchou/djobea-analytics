"use client"

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onPreviousPage: () => void
  onNextPage: () => void
  onFirstPage: () => void
  onLastPage: () => void
  itemsPerPage: number
  onItemsPerPageChange: (itemsPerPage: number) => void
  totalItems: number
  startIndex: number
  endIndex: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  onPreviousPage,
  onNextPage,
  onFirstPage,
  onLastPage,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
  startIndex,
  endIndex,
}: PaginationProps) {
  // Générer les numéros de pages à afficher
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const startPage = Math.max(1, currentPage - 2)
      const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
      {/* Informations de pagination */}
      <div className="flex items-center gap-4">
        <span>
          Affichage de {startIndex} à {endIndex} sur {totalItems} éléments
        </span>

        <div className="flex items-center gap-2">
          <span>Afficher:</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => onItemsPerPageChange(Number.parseInt(value))}
          >
            <SelectTrigger className="w-20 h-8 bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contrôles de pagination */}
      <div className="flex items-center gap-1">
        {/* Première page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onFirstPage}
          disabled={currentPage === 1}
          className="text-gray-400 hover:text-white disabled:opacity-50"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        {/* Page précédente */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          className="text-gray-400 hover:text-white disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Numéros de pages */}
        {pageNumbers.map((pageNumber) => (
          <Button
            key={pageNumber}
            variant={currentPage === pageNumber ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onPageChange(pageNumber)}
            className={
              currentPage === pageNumber
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                : "text-gray-400 hover:text-white"
            }
          >
            {pageNumber}
          </Button>
        ))}

        {/* Page suivante */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="text-gray-400 hover:text-white disabled:opacity-50"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Dernière page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onLastPage}
          disabled={currentPage === totalPages}
          className="text-gray-400 hover:text-white disabled:opacity-50"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
