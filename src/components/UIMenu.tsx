import { FaChevronDown, FaGamepad, FaInfoCircle, FaMap, FaUser, FaUsers } from 'react-icons/fa'
import React, { useState } from 'react'

export interface UIVisibility {
  playerInfo: boolean
  onlinePlayersList: boolean
  controls: boolean
  gameInfo: boolean
  minimap: boolean
}

interface UIMenuProps {
  visibility: UIVisibility
  onToggle: (key: keyof UIVisibility) => void
  onSetAllVisible: (visible: boolean) => void
}

const UIMenu: React.FC<UIMenuProps> = ({ visibility, onToggle, onSetAllVisible }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const menuItems = [
    { key: 'playerInfo' as keyof UIVisibility, label: 'Player', icon: FaUser, color: 'blue' },
    { key: 'onlinePlayersList' as keyof UIVisibility, label: 'Players', icon: FaUsers, color: 'purple' },
    { key: 'controls' as keyof UIVisibility, label: 'Controls', icon: FaGamepad, color: 'green' },
    { key: 'gameInfo' as keyof UIVisibility, label: 'Info', icon: FaInfoCircle, color: 'orange' },
    { key: 'minimap' as keyof UIVisibility, label: 'Map', icon: FaMap, color: 'red' },
  ]

  const getButtonClasses = (item: typeof menuItems[0]) => {
    const isVisible = visibility[item.key]
    const baseClasses = "relative w-10 h-10 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md flex items-center justify-center"

    if (isVisible) {
      const colorClasses = {
        blue: 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-blue-500/25',
        purple: 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 shadow-purple-500/25',
        green: 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 shadow-green-500/25',
        orange: 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 shadow-orange-500/25',
        red: 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 shadow-red-500/25',
      }
      return `${baseClasses} ${colorClasses[item.color as keyof typeof colorClasses]} text-white border border-white/10`
    } else {
      return `${baseClasses} bg-gray-700/60 hover:bg-gray-600/80 text-gray-400 hover:text-gray-300 border border-gray-600/30 shadow-gray-900/50`
    }
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30">
      <div className="bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-md rounded-xl p-2 border border-gray-700/30 shadow-xl">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-10 h-10 rounded-lg bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 hover:text-white transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md border border-gray-600/30 flex items-center justify-center"
            title="Toggle Menu"
          >
            <FaChevronDown
              className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>





              <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-500/50 to-transparent"></div>

              <div className="flex items-center space-x-1.5">
                {menuItems.map(item => (
                  <button
                    key={item.key}
                    onClick={() => onToggle(item.key)}
                    className={getButtonClasses(item)}
                    title={`Toggle ${item.label}`}
                  >
                    <item.icon className="w-4 h-4" />
                  </button>
                ))}
              </div>

        </div>

        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-gray-600/30">
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => onSetAllVisible(true)}
                className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white text-xs font-medium rounded-md transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md shadow-green-500/25"
              >
                Show All
              </button>
              <button
                onClick={() => onSetAllVisible(false)}
                className="px-3 py-1.5 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white text-xs font-medium rounded-md transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md shadow-gray-900/50"
              >
                Hide All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UIMenu
