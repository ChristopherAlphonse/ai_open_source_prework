export interface Player {
  id: string
  x: number
  y: number
  avatar: string
  facing: 'north' | 'south' | 'east' | 'west'
  isMoving: boolean
  username: string
  animationFrame: number
}

export interface Avatar {
  name: string
  frames: {
    north: string[]
    south: string[]
    east: string[]
    // west uses flipped east frames
  }
}

export interface GameState {
  connected: boolean
  playerId: string | null
  players: Record<string, Player>
  avatars: Record<string, Avatar>
  camera: {
    x: number
    y: number
  }
}

export interface JoinGameMessage {
  action: 'join_game'
  username: string
  avatar?: Avatar
}

export interface JoinGameResponse {
  action: 'join_game'
  success: boolean
  playerId: string
  players: Record<string, Player>
  avatars: Record<string, Avatar>
}

export interface MoveMessage {
  action: 'move'
  direction: 'up' | 'down' | 'left' | 'right'
}

export interface PlayersMovedMessage {
  action: 'players_moved'
  players: Record<string, Player>
}
