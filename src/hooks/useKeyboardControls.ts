import { useEffect, useRef } from 'react'

import { GameService } from '../services/GameService'

export const useKeyboardControls = (gameService: GameService | null) => {
  const keysPressed = useRef<Set<string>>(new Set())

  useEffect(() => {
    let movementInterval: NodeJS.Timeout | null = null

    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default browser behavior for movement keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'].includes(event.key)) {
        event.preventDefault()
      }

      // Add key to pressed set
      keysPressed.current.add(event.key.toLowerCase())

      // Start continuous movement if not already running
      if (!movementInterval) {
        // Send initial movement command immediately
        sendMovementCommand()

        // Set up interval for continuous movement
        movementInterval = setInterval(() => {
          sendMovementCommand()
        }, 50) // Send movement commands every 50ms for smooth movement
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed.current.delete(event.key.toLowerCase())

      // If no movement keys are pressed, stop the interval
      const movementKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd']
      const hasMovementKey = movementKeys.some(key => keysPressed.current.has(key.toLowerCase()))

      if (!hasMovementKey && movementInterval) {
        clearInterval(movementInterval)
        movementInterval = null

        // Send stop command to server
        if (gameService) {
          gameService.sendStop()
        }
      }
    }

    const sendMovementCommand = () => {
      if (!gameService) return

      // Send movement command based on currently pressed keys
      // Priority: Up/Down over Left/Right if multiple keys pressed
      // Support both arrow keys and WASD
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

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      if (movementInterval) {
        clearInterval(movementInterval)
      }
    }
  }, [gameService])
}
