import { useCallback } from 'react'
import { generatePath, useNavigate } from 'react-router'
import { Routes } from '~routes'

/** Opens the vote editor with a saved census already chosen. */
export const useNavigateToVote = () => {
  const navigate = useNavigate()
  return useCallback((groupId: string) => navigate(generatePath(Routes.processes.create, { groupId })), [navigate])
}
