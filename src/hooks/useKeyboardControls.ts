import { useEffect, useRef } from 'react'

import { GameService } from '../services/GameService'

export const useKeyboardControls = (gameService: GameService | null) => {
  const keysPressed = useRef<Set<string>>(new Set())

  useEffect(() => {
  let movementInterval: number | null = null

    const handleKeyDown = (event: KeyboardEvent) => {

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'].includes(event.key)) {
        event.preventDefault()
      }


      keysPressed.current.add(event.key.toLowerCase())


      if (!movementInterval) {

        sendMovementCommand()

        const MOVEMENT_INTERVAL_MS = 50
        movementInterval = setInterval(() => {
          sendMovementCommand()
        }, MOVEMENT_INTERVAL_MS)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed.current.delete(event.key.toLowerCase())


      const movementKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd']
      const hasMovementKey = movementKeys.some(key => keysPressed.current.has(key.toLowerCase()))

      if (!hasMovementKey && movementInterval) {
        clearInterval(movementInterval)
        movementInterval = null


        if (gameService) {
          gameService.sendStop()
        }
      }
    }

    const sendMovementCommand = () => {
      if (!gameService) return


      if (keysPressed.current.has('arrowup') || keysPressed.current.has('w')) {
        gameService.sendMove('up')
      } else if (keysPressed.current.has('arrowdown') || keysPressed.current.has('s')) {
        gameService.sendMove('down')
      } else if (keysPressed.current.has('arrowleft') || keysPressed.current.has('a')) {
        gameService.sendMove('left')
      } else if (keysPressed.current.has('arrowright') || keysPressed.current.has('d')) {
        gameService.sendMove('right')
      }
    }


    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)


    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      if (movementInterval) {
        clearInterval(movementInterval)
      }
    }
  }, [gameService])
}
