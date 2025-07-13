"use client"

import styled from "styled-components"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

const PaginationContainer = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--card-bg);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
  margin-top: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`

const PaginationInfo = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;

  .highlight {
    color: var(--text-primary);
    font-weight: 600;
  }
`

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const PageButton = styled.button<{ isActive?: boolean; disabled?: boolean }>`
  background: ${(props) => (props.isActive ? "var(--primary-color)" : "transparent")};
  color: ${(props) => (props.isActive ? "white" : "var(--text-primary)")};
  border: 1px solid ${(props) => (props.isActive ? "var(--primary-color)" : "var(--border-color)")};
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};

  &:hover:not(:disabled) {
    background: ${(props) => (props.isActive ? "var(--primary-hover)" : "var(--hover-bg)")};
    border-color: var(--primary-color);
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`

const PageSizeSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;

  select {
    background: var(--hover-bg);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 0.25rem 0.5rem;
    color: var(--text-primary);
    font-size: 0.9rem;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  }
`

interface ProvidersPaginationProps {
  currentPage: number
  totalPages: number
  total: number
  startIndex: number
  endIndex: number
  pageSize: number
  hasNextPage: boolean
  hasPrevPage: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function ProvidersPagination({
  currentPage,
  totalPages,
  total,
  startIndex,
  endIndex,
  pageSize,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  onPageSizeChange,
}: ProvidersPaginationProps) {
  const generatePageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const start = Math.max(1, currentPage - 2)
      const end = Math.min(totalPages, start + maxVisiblePages - 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  const pageNumbers = generatePageNumbers()

  return (
    <PaginationContainer initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <PaginationInfo>
        Affichage de <span className="highlight">{startIndex}</span> à <span className="highlight">{endIndex}</span> sur{" "}
        <span className="highlight">{total}</span> prestataires
      </PaginationInfo>

      <PaginationControls>
        <PageButton disabled={!hasPrevPage} onClick={() => onPageChange(1)} title="Première page">
          <ChevronsLeft />
        </PageButton>

        <PageButton disabled={!hasPrevPage} onClick={() => onPageChange(currentPage - 1)} title="Page précédente">
          <ChevronLeft />
        </PageButton>

        {pageNumbers.map((pageNum) => (
          <PageButton key={pageNum} isActive={pageNum === currentPage} onClick={() => onPageChange(pageNum)}>
            {pageNum}
          </PageButton>
        ))}

        <PageButton disabled={!hasNextPage} onClick={() => onPageChange(currentPage + 1)} title="Page suivante">
          <ChevronRight />
        </PageButton>

        <PageButton disabled={!hasNextPage} onClick={() => onPageChange(totalPages)} title="Dernière page">
          <ChevronsRight />
        </PageButton>
      </PaginationControls>

      <PageSizeSelector>
        <span>Afficher</span>
        <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
          <option value={6}>6</option>
          <option value={12}>12</option>
          <option value={24}>24</option>
          <option value={48}>48</option>
        </select>
        <span>par page</span>
      </PageSizeSelector>
    </PaginationContainer>
  )
}
