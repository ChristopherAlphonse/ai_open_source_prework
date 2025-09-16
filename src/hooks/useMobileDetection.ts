import { useEffect, useState } from 'react'

export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {

      const isMobileOrTablet = window.innerWidth <= 1024

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
