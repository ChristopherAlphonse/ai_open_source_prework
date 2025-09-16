import { FaArrowDown, FaArrowLeft, FaArrowRight, FaArrowUp, FaChevronDown, FaChevronUp, FaCrown, FaGlobe, FaRunning, FaUser, FaUserAlt } from 'react-icons/fa'
import React, { useState } from 'react'

import { GameState } from '../types/GameTypes'

interface OnlinePlayersListProps {
  gameState: GameState | null
}

const OnlinePlayersList: React.FC<OnlinePlayersListProps> = ({ gameState }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!gameState || Object.keys(gameState.players).length === 0) {
    return null
  }

  const playerCount = Object.keys(gameState.players).length

  return (
    <div className="fixed bottom-4 right-4 z-10 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm text-white rounded-xl shadow-2xl border border-gray-700/50 max-w-xs">
      {/* Header - Always Visible */}
      <div
        className="px-4 py-3 cursor-pointer hover:bg-gray-700/30 transition-all duration-200 rounded-t-xl flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <FaGlobe className="w-4 h-4 mr-2 text-blue-400" />
          <span className="text-sm font-bold">Online Players ({playerCount})</span>
        </div>
        <div className="flex items-center ml-1">
          {isExpanded ? (
            <FaChevronUp className="w-3 h-3 text-gray-400" />
          ) : (
            <FaChevronDown className="w-3 h-3 text-gray-400" />
          )}
        </div>
      </div>

      {/* Players List - Collapsible */}
      {isExpanded && (
        <div className="border-t border-gray-700/50">
          <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar p-2">
        {Object.values(gameState.players)
          .sort((a, b) => {
            // Sort current player first, then alphabetically
            if (a.id === gameState.playerId) return -1
            if (b.id === gameState.playerId) return 1
            return a.username.localeCompare(b.username)
          })
            .map(player => (
            <div
              key={player.id}
              className={`text-xs px-3 py-2 rounded-lg flex items-center justify-between transition-all duration-200 hover:scale-[1.02] ${
                player.id === gameState.playerId
                  ? 'bg-gradient-to-r from-yellow-600/90 to-orange-600/90 text-white font-bold shadow-lg border border-yellow-400/30'
                  : 'bg-gray-700/60 hover:bg-gray-600/80 border border-gray-600/30'
              }`}
            >
              <span className="flex items-center">
                {player.id === gameState.playerId ? (
                  <FaCrown className="w-3 h-3 mr-2 text-yellow-200" />
                ) : (
                  <FaUser className="w-3 h-3 mr-2 text-gray-300" />
                )}
                <span className="font-medium">{player.username}</span>
                {player.id === gameState.playerId && (
                  <span className="text-xs ml-2 opacity-75 bg-yellow-600/50 px-1 rounded">(You)</span>
                )}
              </span>
              <span className="ml-2 flex items-center space-x-1">
                {player.isMoving ? (
                  <FaRunning className="w-3 h-3 text-green-400" />
                ) : (
                  <FaUserAlt className="w-3 h-3 text-gray-400" />
                )}
                <span className="text-xs opacity-75">
                  {player.facing === 'north' && <FaArrowUp className="w-2 h-2 text-blue-400" />}
                  {player.facing === 'south' && <FaArrowDown className="w-2 h-2 text-blue-400" />}
                  {player.facing === 'east' && <FaArrowRight className="w-2 h-2 text-blue-400" />}
                  {player.facing === 'west' && <FaArrowLeft className="w-2 h-2 text-blue-400" />}
                </span>
              </span>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default OnlinePlayersList
