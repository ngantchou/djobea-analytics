"use client"

import styled from "styled-components"
import { motion } from "framer-motion"
import { Search, Filter, X, SlidersHorizontal } from "lucide-react"
import { useState } from "react"

const FiltersContainer = styled(motion.div)`
  background: var(--card-bg);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
  margin-bottom: 2rem;
`

const FiltersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h3 {
    color: var(--text-primary);
    font-size: 1.1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
      width: 1.25rem;
      height: 1.25rem;
      color: var(--primary-color);
    }
  }
`

const ResultsCount = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  align-items: end;

  @media (max-width: 1200px) {
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 1rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const FilterLabel = styled.label`
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const SearchInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

const SearchInput = styled.input`
  width: 100%;
  background: var(--hover-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px var(--primary-bg);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  width: 1rem;
  height: 1rem;
  color: var(--text-secondary);
  pointer-events: none;
`

const Select = styled.select`
  background: var(--hover-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px var(--primary-bg);
  }

  option {
    background: var(--card-bg);
    color: var(--text-primary);
  }
`

const ActionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
`

const FilterActions = styled.div`
  display: flex;
  gap: 0.5rem;
`

const Button = styled.button<{ variant?: "primary" | "secondary" | "danger" }>`
  background: ${(props) => {
    switch (props.variant) {
      case "primary":
        return "var(--primary-color)"
      case "danger":
        return "#ef4444"
      default:
        return "transparent"
    }
  }};
  color: ${(props) => {
    switch (props.variant) {
      case "primary":
        return "white"
      case "danger":
        return "white"
      default:
        return "var(--text-secondary)"
    }
  }};
  border: 1px solid ${(props) => {
    switch (props.variant) {
      case "primary":
        return "var(--primary-color)"
      case "danger":
        return "#ef4444"
      default:
        return "var(--border-color)"
    }
  }};
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;

  &:hover {
    background: ${(props) => {
      switch (props.variant) {
        case "primary":
          return "var(--primary-hover)"
        case "danger":
          return "#dc2626"
        default:
          return "var(--hover-bg)"
      }
    }};
    border-color: ${(props) => {
      switch (props.variant) {
        case "primary":
          return "var(--primary-hover)"
        case "danger":
          return "#dc2626"
        default:
          return "var(--primary-color)"
      }
    }};
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`

const SortControls = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`

export interface ProvidersFilters {
  search: string
  status: string
  specialty: string
  zone: string
  minRating: string
  sortBy?: "name" | "rating" | "missions" | "joinDate"
  sortOrder?: "asc" | "desc"
}

interface ProvidersFiltersProps {
  filters: ProvidersFilters
  onFiltersChange: (filters: ProvidersFilters) => void
  resultsCount: number
  loading?: boolean
}

export function ProvidersFilters({ filters, onFiltersChange, resultsCount, loading = false }: ProvidersFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleFilterChange = (key: keyof ProvidersFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: "",
      specialty: "",
      zone: "",
      minRating: "",
      sortBy: "name",
      sortOrder: "asc",
    })
  }

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== "sortBy" && key !== "sortOrder" && value !== "",
  )

  const exportData = () => {
    // In a real app, this would trigger data export
    console.log("Exporting provider data with filters:", filters)
  }

  return (
    <FiltersContainer initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <FiltersHeader>
        <h3>
          <Filter />
          Filtres de recherche
        </h3>
        <ResultsCount>
          {loading ? (
            "Chargement..."
          ) : (
            <>
              <strong>{resultsCount}</strong> prestataire(s) trouvé(s)
            </>
          )}
        </ResultsCount>
      </FiltersHeader>

      <FiltersGrid>
        <FilterGroup>
          <FilterLabel>Recherche</FilterLabel>
          <SearchInputContainer>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Nom, service, zone, email..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              disabled={loading}
            />
          </SearchInputContainer>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Statut</FilterLabel>
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            disabled={loading}
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="suspended">Suspendu</option>
          </Select>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Spécialité</FilterLabel>
          <Select
            value={filters.specialty}
            onChange={(e) => handleFilterChange("specialty", e.target.value)}
            disabled={loading}
          >
            <option value="">Toutes les spécialités</option>
            <option value="Électricité">Électricité</option>
            <option value="Plomberie">Plomberie</option>
            <option value="Ménage">Ménage</option>
            <option value="Jardinage">Jardinage</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Électroménager">Électroménager</option>
            <option value="Menuiserie">Menuiserie</option>
            <option value="Garde d'enfants">Garde d'enfants</option>
          </Select>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Zone</FilterLabel>
          <Select value={filters.zone} onChange={(e) => handleFilterChange("zone", e.target.value)} disabled={loading}>
            <option value="">Toutes les zones</option>
            <option value="Bonamoussadi Centre">Bonamoussadi Centre</option>
            <option value="Bonamoussadi Nord">Bonamoussadi Nord</option>
            <option value="Bonamoussadi Sud">Bonamoussadi Sud</option>
            <option value="Bonamoussadi Est">Bonamoussadi Est</option>
            <option value="Bonamoussadi Ouest">Bonamoussadi Ouest</option>
          </Select>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Note minimum</FilterLabel>
          <Select
            value={filters.minRating}
            onChange={(e) => handleFilterChange("minRating", e.target.value)}
            disabled={loading}
          >
            <option value="">Toutes les notes</option>
            <option value="4.5">4.5+ étoiles</option>
            <option value="4.0">4.0+ étoiles</option>
            <option value="3.5">3.5+ étoiles</option>
            <option value="3.0">3.0+ étoiles</option>
            <option value="2.0">2.0+ étoiles</option>
          </Select>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Trier par</FilterLabel>
          <Select
            value={filters.sortBy || "name"}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            disabled={loading}
          >
            <option value="name">Nom</option>
            <option value="rating">Note</option>
            <option value="missions">Missions</option>
            <option value="joinDate">Date d'inscription</option>
          </Select>
        </FilterGroup>
      </FiltersGrid>

      <ActionsRow>
        <FilterActions>
          {hasActiveFilters && (
            <Button onClick={clearFilters} disabled={loading}>
              <X />
              Effacer les filtres
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowAdvanced(!showAdvanced)} disabled={loading}>
            <SlidersHorizontal />
            {showAdvanced ? "Masquer" : "Avancé"}
          </Button>
        </FilterActions>

        <SortControls>
          <Button
            variant={filters.sortOrder === "asc" ? "primary" : "secondary"}
            onClick={() => handleFilterChange("sortOrder", "asc")}
            disabled={loading}
          >
            A-Z
          </Button>
          <Button
            variant={filters.sortOrder === "desc" ? "primary" : "secondary"}
            onClick={() => handleFilterChange("sortOrder", "desc")}
            disabled={loading}
          >
            Z-A
          </Button>
          <Button onClick={exportData} disabled={loading}>
            Exporter
          </Button>
        </SortControls>
      </ActionsRow>
    </FiltersContainer>
  )
}
