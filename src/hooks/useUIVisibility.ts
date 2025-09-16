import { useEffect, useState } from 'react'

import { UIVisibility } from '../components/UIMenu'
import { useMobileDetection } from './useMobileDetection'

// All UI elements hidden by default on refresh for clean experience
const DEFAULT_VISIBILITY: UIVisibility = {
  playerInfo: false,
  onlinePlayersList: false,
  controls: false,
  gameInfo: false,
  minimap: false,
}



const STORAGE_KEY = 'mmorpg_ui_visibility'
const MOBILE_STORAGE_KEY = 'mmorpg_ui_visibility_mobile'

export const useUIVisibility = () => {
  const isMobile = useMobileDetection()

  const [visibility, setVisibility] = useState<UIVisibility>(() => {
    // Always start with everything hidden for clean experience on refresh
    // User can manually enable elements through the UI menu
    return DEFAULT_VISIBILITY
  })

  // Save to localStorage whenever visibility changes (use appropriate storage key)
  useEffect(() => {
    const storageKey = isMobile ? MOBILE_STORAGE_KEY : STORAGE_KEY
    try {
      localStorage.setItem(storageKey, JSON.stringify(visibility))
    } catch (error) {
      console.warn('Failed to save UI visibility to localStorage:', error)
    }
  }, [visibility, isMobile])

  // Handle mobile state changes (e.g., window resize from desktop to mobile)
  // Keep the current visibility state as user has manually configured it
  useEffect(() => {
    // Don't reset visibility on mobile state changes - preserve user's manual choices
    // The clean default only applies on initial page load/refresh
  }, [isMobile])

  const toggleVisibility = (key: keyof UIVisibility) => {
    setVisibility(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const setAllVisible = (visible: boolean) => {
    setVisibility(prev => {
      const newVisibility = { ...prev }
      Object.keys(newVisibility).forEach(key => {
        newVisibility[key as keyof UIVisibility] = visible
      })
      return newVisibility
    })
  }

  const resetToDefault = () => {
    setVisibility(DEFAULT_VISIBILITY)
  }

  return {
    visibility,
    toggleVisibility,
    setAllVisible,
    resetToDefault
  }
}
