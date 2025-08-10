"use client"

import { useState } from "react"
import styled from "styled-components"
import { motion } from "framer-motion"
import { Plus, Users, UserCheck, TrendingUp } from "lucide-react"
import { Header } from "@/components/header"
import {
  ProvidersFilters,
  type ProvidersFilters as FiltersType,
} from "@/components/features/providers/providers-filters"
import { ProvidersGrid } from "@/components/features/providers/providers-grid"
import { ProvidersPagination } from "@/components/features/providers/providers-pagination"
import { AddProviderModal } from "@/components/features/providers/add-provider-modal"
import { ViewProviderModal } from "@/components/features/providers/view-provider-modal"
import { EditProviderModal } from "@/components/features/providers/edit-provider-modal"
import { ContactProviderModal } from "@/components/features/providers/contact-provider-modal"
import { DeleteProviderModal } from "@/components/features/providers/delete-provider-modal"
import { useProvidersData } from "@/hooks/use-providers-data"

const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
`

const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`

const PageHeader = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`

const HeaderContent = styled.div`
  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }

  p {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }
`

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;

  @media (max-width: 768px) {
    justify-content: center;
  }
`

const AddButton = styled.button`
  background: var(--primary-gradient);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow);
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`

const StatCard = styled(motion.div)`
  background: var(--card-bg);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  backdrop-filter: blur(10px);

  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    h3 {
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    svg {
      width: 1.5rem;
      height: 1.5rem;
      color: var(--primary-color);
    }
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }

  .stat-change {
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;

    &.positive {
      color: #22c55e;
    }

    &.negative {
      color: #ef4444;
    }

    svg {
      width: 0.8rem;
      height: 0.8rem;
    }
  }
`

export default function ProvidersPage() {
  const [filters, setFilters] = useState<FiltersType>({
    search: "",
    status: "",
    specialty: "",
    zone: "",
    minRating: "",
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  const [showAddModal, setShowAddModal] = useState(false)

  // Modal states
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null)
  const [selectedProviderName, setSelectedProviderName] = useState<string>("")
  const [activeModal, setActiveModal] = useState<"view" | "edit" | "contact" | "delete" | null>(null)

  // Fixed: Pass filters properly with correct interface
  const apiFilters = {
    page: currentPage,
    limit: pageSize,
    search: filters.search || undefined,
    status: filters.status || undefined,
    specialty: filters.specialty || undefined,
    zone: filters.zone || undefined,
    rating: filters.minRating ? Number.parseFloat(filters.minRating) : undefined,
  }

  const { data, loading, error, refetch } = useProvidersData(apiFilters)

  // Extract providers and pagination from the response
  const providers = data?.data || []
  const pagination = data?.pagination || {
    page: currentPage,
    totalPages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false,
  }
  const stats = data?.stats || {
    total: 0,
    active: 0,
    available: 0,
    avgRating: 0,
  }

  const handleFiltersChange = (newFilters: FiltersType) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when page size changes
  }

  const handleAddProvider = () => {
    setShowAddModal(true)
  }

  const handleCloseAddModal = () => {
    setShowAddModal(false)
    refetch() // Refresh data after adding
  }

  // Modal handlers
  const handleView = (providerId: string) => {
    setSelectedProviderId(providerId)
    setActiveModal("view")
  }

  const handleEdit = (providerId: string) => {
    setSelectedProviderId(providerId)
    setActiveModal("edit")
  }

  const handleContact = (providerId: string) => {
    setSelectedProviderId(providerId)
    setActiveModal("contact")
  }

  const handleDelete = (providerId: string, providerName: string) => {
    setSelectedProviderId(providerId)
    setSelectedProviderName(providerName)
    setActiveModal("delete")
  }

  const closeModal = () => {
    setActiveModal(null)
    setSelectedProviderId(null)
    setSelectedProviderName("")
    refetch() // Refresh data after modal actions
  }

  // Create proper pagination object for the component
  const paginationProps = {
    page: pagination.page,
    totalPages: pagination.totalPages || Math.ceil(pagination.total / pageSize),
    total: pagination.total,
    startIndex: (pagination.page - 1) * pageSize + 1,
    endIndex: Math.min(pagination.page * pageSize, pagination.total),
    hasNextPage: pagination.hasNext,
    hasPrevPage: pagination.hasPrev,
  }

  if (error) {
    return (
      <PageContainer>
        <ContentContainer>
          <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--text-secondary)" }}>
            <h2>Erreur de chargement</h2>
            <p>{error}</p>
            <button onClick={refetch} style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
              Réessayer
            </button>
          </div>
        </ContentContainer>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <ContentContainer>
        <PageHeader initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <HeaderContent>
            <h1>Gestion des Prestataires</h1>
            <p>Gérez et suivez tous vos prestataires de services</p>
          </HeaderContent>
          <HeaderActions>
            <AddButton onClick={handleAddProvider}>
              <Plus />
              Ajouter un prestataire
            </AddButton>
          </HeaderActions>
        </PageHeader>

        <StatsGrid>
          <StatCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="stat-header">
              <h3>Total Prestataires</h3>
              <Users />
            </div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-change positive">
              <TrendingUp />
              +12% ce mois
            </div>
          </StatCard>

          <StatCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="stat-header">
              <h3>Actifs</h3>
              <UserCheck />
            </div>
            <div className="stat-value">{stats.active}</div>
            <div className="stat-change positive">
              <TrendingUp />
              +5% ce mois
            </div>
          </StatCard>

          <StatCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="stat-header">
              <h3>Disponibles</h3>
              <UserCheck />
            </div>
            <div className="stat-value">{stats.available}</div>
            <div className="stat-change positive">
              <TrendingUp />
              +8% ce mois
            </div>
          </StatCard>

          <StatCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="stat-header">
              <h3>Note Moyenne</h3>
              <TrendingUp />
            </div>
            <div className="stat-value">{stats.avgRating?.toFixed(1) || "0.0"}</div>
            <div className="stat-change positive">
              <TrendingUp />
              +0.2 ce mois
            </div>
          </StatCard>
        </StatsGrid>

        <ProvidersFilters 
          filters={filters} 
          onFiltersChange={handleFiltersChange} 
          resultsCount={pagination.total} 
        />

        <ProvidersGrid
          providers={providers}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onContact={handleContact}
          onDelete={handleDelete}
        />

        <ProvidersPagination
          currentPage={paginationProps.page}
          totalPages={paginationProps.totalPages}
          total={paginationProps.total}
          startIndex={paginationProps.startIndex}
          endIndex={paginationProps.endIndex}
          pageSize={pageSize}
          hasNextPage={paginationProps.hasNextPage}
          hasPrevPage={paginationProps.hasPrevPage}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />

        {/* All Modals */}
        <AddProviderModal isOpen={showAddModal} onClose={handleCloseAddModal} />

        <ViewProviderModal isOpen={activeModal === "view"} onClose={closeModal} providerId={selectedProviderId} />

        <EditProviderModal isOpen={activeModal === "edit"} onClose={closeModal} providerId={selectedProviderId} />

        <ContactProviderModal isOpen={activeModal === "contact"} onClose={closeModal} providerId={selectedProviderId} />

        <DeleteProviderModal
          isOpen={activeModal === "delete"}
          onClose={closeModal}
          providerId={selectedProviderId}
          providerName={selectedProviderName}
        />
      </ContentContainer>
    </PageContainer>
  )
}