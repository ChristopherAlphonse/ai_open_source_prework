import { useEffect, useState } from 'react'

export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {

  const MOBILE_BREAKPOINT = 1024
  const isMobileOrTablet = window.innerWidth <= MOBILE_BREAKPOINT

      setIsMobile(isMobileOrTablet)
    }


    checkMobile()


    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  return isMobile
}
