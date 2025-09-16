import React, { useEffect, useRef } from 'react'

import { GameState } from '../types/GameTypes'

interface MinimapProps {
  gameState: GameState | null
  worldImageSrc: string
}

const Minimap: React.FC<MinimapProps> = ({ gameState, worldImageSrc }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const worldImageRef = useRef<HTMLImageElement>(null)

  const MINIMAP_SIZE = 150
  const WORLD_SIZE = 2048

  useEffect(() => {
    // Load world image
    const image = new Image()
    worldImageRef.current = image
    image.onload = () => {
      drawMinimap()
    }
    image.src = worldImageSrc
  }, [worldImageSrc])

  useEffect(() => {
    drawMinimap()
  }, [gameState])

  const drawMinimap = () => {
    const canvas = canvasRef.current
    const worldImage = worldImageRef.current
    if (!canvas || !worldImage || !worldImage.complete) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE)

    // Draw world map scaled down
    ctx.drawImage(worldImage, 0, 0, MINIMAP_SIZE, MINIMAP_SIZE)

    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE)

    if (!gameState) return

    // Draw players as dots
    Object.values(gameState.players).forEach(player => {
      const minimapX = (player.x / WORLD_SIZE) * MINIMAP_SIZE
      const minimapY = (player.y / WORLD_SIZE) * MINIMAP_SIZE

      ctx.beginPath()
      ctx.arc(minimapX, minimapY, 3, 0, Math.PI * 2)

      // Different colors for current player vs others
      if (player.id === gameState.playerId) {
        ctx.fillStyle = '#FFD700' // Gold for current player
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 2
        ctx.fill()
        ctx.stroke()
      } else {
        ctx.fillStyle = '#FF4444' // Red for other players
        ctx.fill()
      }
    })

    // Draw viewport rectangle showing current view
    if (gameState.playerId && gameState.camera) {
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      const minimapViewX = (gameState.camera.x / WORLD_SIZE) * MINIMAP_SIZE
      const minimapViewY = (gameState.camera.y / WORLD_SIZE) * MINIMAP_SIZE
      const minimapViewWidth = (viewportWidth / WORLD_SIZE) * MINIMAP_SIZE
      const minimapViewHeight = (viewportHeight / WORLD_SIZE) * MINIMAP_SIZE

      ctx.strokeStyle = '#00FF00'
      ctx.lineWidth = 1
      ctx.strokeRect(minimapViewX, minimapViewY, minimapViewWidth, minimapViewHeight)
    }
  }

  const handleMinimapClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameState) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top

    // Convert minimap coordinates to world coordinates
    const worldX = (clickX / MINIMAP_SIZE) * WORLD_SIZE
    const worldY = (clickY / MINIMAP_SIZE) * WORLD_SIZE

    // You can emit this as an event or callback to parent component
    console.log(`Minimap click: (${Math.round(worldX)}, ${Math.round(worldY)})`)

    // For now, we'll dispatch a custom event that the parent can listen to
    window.dispatchEvent(new CustomEvent('minimapClick', {
      detail: { x: worldX, y: worldY }
    }))
  }

  return (
    <div className="fixed top-4 right-4 z-20 bg-black bg-opacity-75 rounded-lg p-2">

      <canvas
        ref={canvasRef}
        width={MINIMAP_SIZE}
        height={MINIMAP_SIZE}
        className="border border-gray-600 rounded cursor-pointer hover:border-gray-400 transition-colors"
        onClick={handleMinimapClick}
        title="Click to move camera view"
      />
      <div className="text-xs text-gray-300 mt-1 text-center">
        <div className="flex items-center justify-center space-x-2">
          <span className="flex items-center">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></div>
            You
          </span>
          <span className="flex items-center">
            <div className="w-2 h-2 bg-red-400 rounded-full mr-1"></div>
            Others
          </span>
        </div>
      </div>
    </div>
  )
}

export default Minimap
