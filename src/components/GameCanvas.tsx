import { Avatar, GameState, Player } from '../types/GameTypes'
import React, { useEffect, useRef } from 'react'

interface GameCanvasProps {
  gameState: GameState | null
  onCanvasClick: (worldX: number, worldY: number) => void
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, onCanvasClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const worldImageRef = useRef<HTMLImageElement>(null)
  const avatarImagesRef = useRef<Map<string, HTMLImageElement>>(new Map())
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to fill the viewport
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      redraw()
    }

    // Draw everything with animation frame throttling
    const redraw = () => {
      if (!gameState) return

      // Cancel any pending animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      // Schedule the actual draw for the next animation frame
      animationFrameRef.current = requestAnimationFrame(() => {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Draw world map with camera offset
        drawWorldMap()

        // Draw all players
        drawPlayers()

        animationFrameRef.current = null
      })
    }

    // Draw the world map with camera transformation
    const drawWorldMap = () => {
      const worldImage = worldImageRef.current
      if (!worldImage || !worldImage.complete || !gameState) return

      const camera = gameState.camera

      // Draw the world image offset by camera position
      ctx.drawImage(
        worldImage,
        -camera.x, // Offset by camera X
        -camera.y, // Offset by camera Y
        worldImage.naturalWidth,
        worldImage.naturalHeight
      )
    }

    // Draw all players
    const drawPlayers = () => {
      if (!gameState) return

      Object.values(gameState.players).forEach(player => {
        drawPlayer(player)
      })
    }

    // Draw a single player
    const drawPlayer = (player: Player) => {
      const avatar = gameState?.avatars[player.avatar]
      if (!avatar) return

      // Get the correct avatar image
      const direction = player.facing
      const frameIndex = player.animationFrame

      // For west direction, use east frames (will be flipped)
      const actualDirection = direction === 'west' ? 'east' : direction
      const actualImageKey = `${player.avatar}-${actualDirection}-${frameIndex}`

      const avatarImage = avatarImagesRef.current.get(actualImageKey)
      if (!avatarImage) return

      // Convert world coordinates to screen coordinates
      const screenX = player.x - gameState.camera.x
      const screenY = player.y - gameState.camera.y

      // Only draw if player is visible on screen
      if (screenX < -avatarImage.width || screenX > canvas.width ||
          screenY < -avatarImage.height || screenY > canvas.height) {
        return
      }

      ctx.save()

      // Flip horizontally for west direction
      if (direction === 'west') {
        ctx.scale(-1, 1)
        ctx.drawImage(avatarImage, -screenX - avatarImage.width, screenY)
      } else {
        ctx.drawImage(avatarImage, screenX, screenY)
      }

      ctx.restore()

      // Draw username label
      drawUsernameLabel(player, screenX, screenY)
    }

    // Draw username label above player
    const drawUsernameLabel = (player: Player, screenX: number, screenY: number) => {
      ctx.save()

      // Different styling for current player vs others
      const isCurrentPlayer = gameState?.playerId === player.id

      // Set text style
      ctx.font = isCurrentPlayer ? 'bold 14px Arial' : '12px Arial'
      ctx.textAlign = 'center'

      // Position text above avatar (estimate avatar width as 32px)
      const textX = screenX + 16
      const textY = screenY - 5

      // Use shadow for better readability instead of stroke to reduce flickering
      ctx.shadowColor = 'black'
      ctx.shadowBlur = 3
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1

      // Set fill color
      ctx.fillStyle = isCurrentPlayer ? '#FFD700' : 'white' // Gold for current player

      // Draw text once with shadow
      ctx.fillText(player.username, textX, textY)

      // Add movement indicator for moving players
      if (player.isMoving && !isCurrentPlayer) {
        ctx.fillStyle = '#00FF00'
        ctx.beginPath()
        ctx.arc(textX + ctx.measureText(player.username).width / 2 + 8, textY - 4, 3, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    }

    // Load the world image
    const loadWorldImage = () => {
      const image = new Image()
      worldImageRef.current = image

      image.onload = () => {

        redraw()
      }

      image.onerror = (error) => {
        console.error('Failed to load world map:', error)
      }

      image.src = '/world.jpg'
    }

    // Set up canvas and load world image
    resizeCanvas()
    loadWorldImage()

    // Handle window resize
    window.addEventListener('resize', resizeCanvas)

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameState])

  // Effect to handle game state changes and load avatar images
  useEffect(() => {
    if (gameState && Object.keys(gameState.avatars).length > 0) {
      // Load avatar images when avatars are available
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')

      if (canvas && ctx) {
        // Load avatar images
        const loadAvatarImages = async (avatars: Record<string, Avatar>) => {
          const promises: Promise<void>[] = []

          Object.entries(avatars).forEach(([avatarName, avatar]) => {
            Object.entries(avatar.frames).forEach(([direction, frames]) => {
              frames.forEach((base64Data, frameIndex) => {
                const key = `${avatarName}-${direction}-${frameIndex}`
                if (!avatarImagesRef.current.has(key)) {
                  const promise = new Promise<void>((resolve, reject) => {
                    const img = new Image()
                    img.onload = () => {
                      avatarImagesRef.current.set(key, img)
                      resolve()
                    }
                    img.onerror = reject
                    img.src = base64Data
                  })
                  promises.push(promise)
                }
              })
            })
          })

          try {
            await Promise.all(promises)


            // Redraw everything
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Draw world map
            const worldImage = worldImageRef.current
            if (worldImage && worldImage.complete) {
              ctx.drawImage(
                worldImage,
                -gameState.camera.x,
                -gameState.camera.y,
                worldImage.naturalWidth,
                worldImage.naturalHeight
              )
            }

            // Draw all players
            Object.values(gameState.players).forEach(player => {
              const avatar = gameState.avatars[player.avatar]
              if (!avatar) return

              const direction = player.facing
              const frameIndex = player.animationFrame
              const actualDirection = direction === 'west' ? 'east' : direction
              const actualImageKey = `${player.avatar}-${actualDirection}-${frameIndex}`

              const avatarImage = avatarImagesRef.current.get(actualImageKey)
              if (!avatarImage) return

              const screenX = player.x - gameState.camera.x
              const screenY = player.y - gameState.camera.y

              if (screenX < -avatarImage.width || screenX > canvas.width ||
                  screenY < -avatarImage.height || screenY > canvas.height) {
                return
              }

              ctx.save()

              if (direction === 'west') {
                ctx.scale(-1, 1)
                ctx.drawImage(avatarImage, -screenX - avatarImage.width, screenY)
              } else {
                ctx.drawImage(avatarImage, screenX, screenY)
              }

              ctx.restore()

              // Draw username label
              ctx.save()
              ctx.font = '14px Arial'
              ctx.fillStyle = 'white'
              ctx.strokeStyle = 'black'
              ctx.lineWidth = 2
              ctx.textAlign = 'center'

              const textX = screenX + avatarImage.width / 2
              const textY = screenY - 5

              ctx.strokeText(player.username, textX, textY)
              ctx.fillText(player.username, textX, textY)
              ctx.restore()
            })
          } catch (error) {
            console.error('Failed to load avatar images:', error)
          }
        }

        loadAvatarImages(gameState.avatars)
      }
    }
  }, [gameState])

  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameState) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top

    // Convert screen coordinates to world coordinates
    const worldX = clickX + gameState.camera.x
    const worldY = clickY + gameState.camera.y

    // Ensure coordinates are within map bounds
    const clampedX = Math.max(0, Math.min(worldX, 2048))
    const clampedY = Math.max(0, Math.min(worldY, 2048))

    onCanvasClick(clampedX, clampedY)
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-screen h-screen block cursor-crosshair image-render-pixelated"
      onClick={handleCanvasClick}
    />
  )
}

export default GameCanvas
