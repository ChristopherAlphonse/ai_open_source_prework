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

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      redraw()
    }

    const redraw = () => {
      if (!gameState) return

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }


      animationFrameRef.current = requestAnimationFrame(() => {

        ctx.clearRect(0, 0, canvas.width, canvas.height)


        drawWorldMap()


        drawPlayers()

        animationFrameRef.current = null
      })
    }


    const drawWorldMap = () => {
      const worldImage = worldImageRef.current
      if (!worldImage || !worldImage.complete || !gameState) return

      const camera = gameState.camera


      ctx.drawImage(
        worldImage,
        -camera.x,
        -camera.y,
        worldImage.naturalWidth,
        worldImage.naturalHeight
      )
    }


    const drawPlayers = () => {
      if (!gameState) return

      Object.values(gameState.players).forEach(player => {
        drawPlayer(player)
      })
    }


    const drawPlayer = (player: Player) => {
      const avatar = gameState?.avatars[player.avatar]
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


      drawUsernameLabel(player, screenX, screenY)
    }


    const drawUsernameLabel = (player: Player, screenX: number, screenY: number) => {
      ctx.save()


      const isCurrentPlayer = gameState?.playerId === player.id


      ctx.font = isCurrentPlayer ? 'bold 14px Arial' : '12px Arial'
      ctx.textAlign = 'center'


      const textX = screenX + 16
      const textY = screenY - 5


      ctx.shadowColor = 'black'
      ctx.shadowBlur = 3
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1


      ctx.fillStyle = isCurrentPlayer ? '#FFD700' : 'white'


      ctx.fillText(player.username, textX, textY)


      if (player.isMoving && !isCurrentPlayer) {
        ctx.fillStyle = '#00FF00'
        ctx.beginPath()
        ctx.arc(textX + ctx.measureText(player.username).width / 2 + 8, textY - 4, 3, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    }


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


    resizeCanvas()
    loadWorldImage()


    window.addEventListener('resize', resizeCanvas)


    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameState])


  useEffect(() => {
    if (gameState && Object.keys(gameState.avatars).length > 0) {

      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')

      if (canvas && ctx) {

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



            ctx.clearRect(0, 0, canvas.width, canvas.height)


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


  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameState) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top


    const worldX = clickX + gameState.camera.x
    const worldY = clickY + gameState.camera.y


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
