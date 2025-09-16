import { FaArrowDown, FaArrowLeft, FaArrowRight, FaArrowUp, FaEdit, FaGamepad, FaMouse } from 'react-icons/fa'

import React from 'react'

const Controls: React.FC = () => {
  return (
    <div className="fixed bottom-4 left-4 z-10 bg-black bg-opacity-75 text-white rounded-lg p-3">
      <div className="text-sm font-bold mb-2 flex items-center">
        <FaGamepad className="w-4 h-4 mr-2" />
        Controls
      </div>
      <div className="text-xs space-y-1">
        <div className="flex items-center">
          <FaArrowUp className="w-3 h-3 mr-2" />
          W Move Up
        </div>
        <div className="flex items-center">
          <FaArrowDown className="w-3 h-3 mr-2" />
          S Move Down
        </div>
        <div className="flex items-center">
          <FaArrowLeft className="w-3 h-3 mr-2" />
          A Move Left
        </div>
        <div className="flex items-center">
          <FaArrowRight className="w-3 h-3 mr-2" />
          D Move Right
        </div>
        <div className="text-yellow-300 mt-2 flex items-center">
          <FaMouse className="w-3 h-3 mr-2" />
          Click anywhere to automatically move to position
        </div>
        <div className="text-cyan-300 flex items-center">
          <FaEdit className="w-3 h-3 mr-2" />
          Click your name to update
        </div>
        <div className="text-gray-300">Hold arrow keys for continuous movement</div>
      </div>
    </div>
  )
}

export default Controls
