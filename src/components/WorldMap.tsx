import React, { useEffect, useRef, useState } from 'react'

import Controls from './Controls'
import GameCanvas from './GameCanvas'
import GameInfo from './GameInfo'
import { GameService } from '../services/GameService'
import { GameState } from '../types/GameTypes'
import Minimap from './Minimap'
import OnlinePlayersList from './OnlinePlayersList'
import PlayerInfo from './PlayerInfo'
import UIMenu from './UIMenu'
import { useKeyboardControls } from '../hooks/useKeyboardControls'
import { useUIVisibility } from '../hooks/useUIVisibility'

const WorldMap: React.FC = () => {
  const gameServiceRef = useRef<GameService | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const { visibility, toggleVisibility, setAllVisible } = useUIVisibility()

  // Initialize game service
  useEffect(() => {
    if (!gameServiceRef.current) {
      gameServiceRef.current = new GameService()
      gameServiceRef.current.onGameStateChange((state) => {
        setGameState(state)
      })
    }

    return () => {
      if (gameServiceRef.current) {
        gameServiceRef.current.disconnect()
      }
    }
  }, [])

  // Set up keyboard controls
  useKeyboardControls(gameServiceRef.current)

  // Handle canvas click for movement
  const handleCanvasClick = (worldX: number, worldY: number) => {
    const gameService = gameServiceRef.current
    if (gameService) {
      gameService.sendMoveToPosition(worldX, worldY)
    }

  }

  // Handle username change
  const handleUsernameChange = (newUsername: string) => {
    const gameService = gameServiceRef.current
    if (gameService) {
      gameService.changeUsername(newUsername)
    }
  }

  // Handle minimap click
  useEffect(() => {
    const handleMinimapClick = (event: CustomEvent) => {
      const { x, y } = event.detail
      handleCanvasClick(x, y)
    }

    window.addEventListener('minimapClick', handleMinimapClick as EventListener)

    return () => {
      window.removeEventListener('minimapClick', handleMinimapClick as EventListener)
    }
  }, [])

  return (
    <div className="relative w-full h-full">
      {/* Connection Status Overlay */}
      {(!gameState?.connected) && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white px-6 py-4 rounded-lg shadow-lg text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <div className="text-lg font-semibold">Connecting to Game Server...</div>
            <div className="text-sm text-gray-400 mt-1">Please wait while we establish connection</div>
          </div>
        </div>
      )}

      {/* Main game canvas */}
      <GameCanvas
        gameState={gameState}
        onCanvasClick={handleCanvasClick}
      />

      {/* UI Components - conditionally rendered based on visibility */}
      {visibility.playerInfo && (
        <PlayerInfo
          gameState={gameState}
          onUsernameChange={handleUsernameChange}
        />
      )}

      {visibility.onlinePlayersList && (
        <OnlinePlayersList gameState={gameState} />
      )}

      {visibility.controls && (
        <Controls />
      )}

      {visibility.gameInfo && (
        <GameInfo gameState={gameState} />
      )}

      {visibility.minimap && (
        <Minimap
          gameState={gameState}
          worldImageSrc="/world.jpg"
        />
      )}

      {/* UI Menu */}
      <UIMenu
        visibility={visibility}
        onToggle={toggleVisibility}
        onSetAllVisible={setAllVisible}
      />
    </div>
  )
}

export default WorldMap
