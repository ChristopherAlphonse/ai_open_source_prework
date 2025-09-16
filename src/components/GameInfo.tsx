import { FaMap } from 'react-icons/fa'
import { GameState } from '../types/GameTypes'
import React from 'react'

interface GameInfoProps {
  gameState: GameState | null
}

const GameInfo: React.FC<GameInfoProps> = ({ gameState }) => {
  if (!gameState?.connected) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 z-10 bg-black bg-opacity-75 text-white rounded-lg p-3">
      <div className="text-sm font-bold mb-2 flex items-center">
        <FaMap className="w-4 h-4 mr-2" />
        World Info
      </div>
      <div className="text-xs space-y-1">
        <div>Map Size: {window.innerWidth} × {window.innerHeight}</div>
        <div>Camera: ({Math.round(gameState.camera.x)}, {Math.round(gameState.camera.y)})</div>
        <div className="text-gray-300 mt-2">Your avatar is always centered</div>
      </div>
    </div>
  )
}

export default GameInfo
