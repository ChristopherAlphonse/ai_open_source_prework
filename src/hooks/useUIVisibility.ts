import { useEffect, useState } from 'react'

import { UIVisibility } from '../components/UIMenu'
import { useMobileDetection } from './useMobileDetection'

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
    return DEFAULT_VISIBILITY
  })

  useEffect(() => {
    const storageKey = isMobile ? MOBILE_STORAGE_KEY : STORAGE_KEY
    try {
      localStorage.setItem(storageKey, JSON.stringify(visibility))
    } catch (error) {
      console.warn('Failed to save UI visibility to localStorage:', error)
    }
  }, [visibility, isMobile])

  useEffect(() => {
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
