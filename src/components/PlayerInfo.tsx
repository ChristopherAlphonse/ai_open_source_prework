import { FaMapMarkerAlt, FaSpinner, FaUser, FaWifi } from 'react-icons/fa'
import React, { useState } from 'react'

import { GameState } from '../types/GameTypes'
import { PiWifiSlashBold } from 'react-icons/pi'

interface PlayerInfoProps {
  gameState: GameState | null
  onUsernameChange: (newUsername: string) => void
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ gameState, onUsernameChange }) => {
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [isChangingUsername, setIsChangingUsername] = useState(false)

  React.useEffect(() => {
    // Initialize username input with stored username
    const storedUsername = localStorage.getItem('mmorpg_username') || 'Tim'
    setNewUsername(storedUsername)
  }, [])

  const handleUsernameSubmit = () => {
    if (newUsername.trim() && newUsername !== gameState?.players[gameState.playerId!]?.username) {
      setIsChangingUsername(true)
      onUsernameChange(newUsername.trim())
      setTimeout(() => setIsChangingUsername(false), 2000)
    }
    setIsEditingUsername(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUsernameSubmit()
    } else if (e.key === 'Escape') {
      setIsEditingUsername(false)
    }
  }

  return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center space-x-3">
          {/* Connection Status */}
          <div className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center ${
            gameState?.connected
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}>
            {gameState?.connected ? (
              <>
                <FaWifi className="w-3 h-3 mr-1" />
                Connected
              </>
            ) : (
              <>
                <PiWifiSlashBold className="w-3 h-3 mr-1" />
                Connecting...
              </>
            )}
          </div>

          {/* Player Name */}
          {gameState?.playerId && (
            <div className={`px-3 py-1 text-white rounded text-sm transition-colors flex items-center ${
              isChangingUsername ? 'bg-orange-500' : 'bg-blue-500'
            }`}>
              <FaUser className="w-3 h-3 mr-2" />
              {isChangingUsername ? (
                <span className="flex items-center">
                  <FaSpinner className="w-3 h-3 animate-spin mr-1" />
                  Updating...
                </span>
              ) : isEditingUsername ? (
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  onBlur={handleUsernameSubmit}
                  onKeyDown={handleKeyDown}
                  className="bg-blue-600 text-white border-none outline-none w-20 px-1"
                  autoFocus
                  maxLength={20}
                />
              ) : (
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => {
                    setNewUsername(gameState.players[gameState.playerId!]?.username || '')
                    setIsEditingUsername(true)
                  }}
                  title="Click to edit username"
                >
                  {gameState.players[gameState.playerId]?.username || 'Unknown'}
                </span>
              )}
            </div>
          )}

          {/* Player Coordinates */}
          {gameState?.playerId && (
            <div className="px-3 py-1 bg-purple-500 text-white rounded text-sm flex items-center">
              <FaMapMarkerAlt className="w-3 h-3 mr-2" />
              ({Math.round(gameState.players[gameState.playerId]?.x || 0)}, {Math.round(gameState.players[gameState.playerId]?.y || 0)})
            </div>
          )}
        </div>
      </div>
  )
}

export default PlayerInfo
