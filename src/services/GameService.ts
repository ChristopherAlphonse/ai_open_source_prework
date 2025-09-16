import { GameState, JoinGameMessage, JoinGameResponse, MoveMessage, PlayersMovedMessage } from '../types/GameTypes'
const RECONNECT_DELAY_MS = 3000

export class GameService {
  private ws: WebSocket | null = null
  private gameState: GameState = {
    connected: false,
    playerId: null,
    players: {},
    avatars: {},
    camera: { x: 0, y: 0 }
  }
  private onStateChange: ((state: GameState) => void) | null = null
  private currentUsername: string = ''
  private pendingUsername: string | null = null

  constructor() {

    this.currentUsername = localStorage.getItem('mmorpg_username') || 'Tim'
    this.connect()
  }

  private connect() {
    try {
      this.ws = new WebSocket('wss://codepath-mmorg.onrender.com')

      this.ws.onopen = () => {
        console.log(' Connected to game server')
        this.gameState.connected = true
        this.notifyStateChange()
        const username = this.pendingUsername || this.currentUsername
        if (this.pendingUsername) {
          this.currentUsername = this.pendingUsername
          localStorage.setItem('mmorpg_username', this.currentUsername)
          this.pendingUsername = null
        }
        this.joinGame(username)
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('Failed to parse message:', error)
        }
      }

      this.ws.onclose = () => {
  console.log('Disconnected from game server - attempting to reconnect in ' + RECONNECT_DELAY_MS + 'ms...')
        this.gameState.connected = false
        this.gameState.playerId = null
        this.gameState.players = {}
        this.gameState.avatars = {}
        this.notifyStateChange()
  setTimeout(() => this.connect(), RECONNECT_DELAY_MS)
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket connection error:', error)
        console.log('Trying to connect to:', 'wss://codepath-mmorg.onrender.com')
        console.log('If connection fails, the game server might be temporarily unavailable')
      }
    } catch (error) {
      console.error('Failed to connect:', error)

  setTimeout(() => this.connect(), RECONNECT_DELAY_MS)
    }
  }

  private joinGame(username: string) {
    const joinMessage: JoinGameMessage = {
      action: 'join_game',
      username: username
    }
    this.sendMessage(joinMessage)
  }

  public changeUsername(newUsername: string) {
    this.currentUsername = newUsername
    localStorage.setItem('mmorpg_username', newUsername)

    if (this.gameState.playerId && this.gameState.players[this.gameState.playerId]) {
      this.gameState.players[this.gameState.playerId].username = newUsername
      this.notifyStateChange()
    }

    if (this.ws) {
      this.ws.close()
    }
    this.pendingUsername = newUsername
    this.connect()
  }

  public getCurrentUsername(): string {
    return this.currentUsername
  }

  private handleMessage(message: any) {
    switch (message.action) {
      case 'join_game':
        this.handleJoinGameResponse(message as JoinGameResponse)
        break
      case 'players_moved':
        this.handlePlayersMovedMessage(message as PlayersMovedMessage)
        break
      case 'player_joined':
        if (message.player && message.avatar) {
          this.gameState.players[message.player.id] = message.player
          this.gameState.avatars[message.avatar.name] = message.avatar
          this.notifyStateChange()
        }
        break
      case 'player_left':
        if (message.playerId && this.gameState.players[message.playerId]) {
          delete this.gameState.players[message.playerId]
          this.notifyStateChange()
        }
        break
      default:
        console.log('Unknown message:', message)
    }
  }

  private handleJoinGameResponse(response: JoinGameResponse) {
    if (response.success) {


      const previousPlayer = this.gameState.playerId ? this.gameState.players[this.gameState.playerId] : null

      this.gameState.playerId = response.playerId
      this.gameState.players = response.players
      this.gameState.avatars = response.avatars

      const myPlayer = this.gameState.players[response.playerId]
      if (myPlayer && previousPlayer && this.pendingUsername) {

        myPlayer.username = this.currentUsername
      }

      if (myPlayer) {
        this.updateCamera(myPlayer.x, myPlayer.y)
      }

      this.notifyStateChange()
    } else {
      console.error('Failed to join game:', response)
    }
  }

  private handlePlayersMovedMessage(message: PlayersMovedMessage) {
    Object.assign(this.gameState.players, message.players)

    if (this.gameState.playerId && message.players[this.gameState.playerId]) {
      const myPlayer = message.players[this.gameState.playerId]
      this.updateCamera(myPlayer.x, myPlayer.y)
    }

    this.notifyStateChange()
  }

  private updateCamera(playerX: number, playerY: number) {
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
  const MAP_SIZE = 2048

  let cameraX = playerX - screenWidth / 2
  let cameraY = playerY - screenHeight / 2

  cameraX = Math.max(0, Math.min(cameraX, MAP_SIZE - screenWidth))
  cameraY = Math.max(0, Math.min(cameraY, MAP_SIZE - screenHeight))

    this.gameState.camera.x = cameraX
    this.gameState.camera.y = cameraY
  }

  private sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket not connected, cannot send message')
    }
  }

  public sendMove(direction: 'up' | 'down' | 'left' | 'right') {
    const moveMessage: MoveMessage = {
      action: 'move',
      direction
    }
    this.sendMessage(moveMessage)
  }

  public sendStop() {
    const stopMessage = {
      action: 'stop'
    }
    this.sendMessage(stopMessage)
  }

  public sendMoveToPosition(x: number, y: number) {
    const moveMessage = {
      action: 'move',
      x: x,
      y: y
    }
    this.sendMessage(moveMessage)
  }

  public onGameStateChange(callback: (state: GameState) => void) {
    this.onStateChange = callback
  }

  private notifyStateChange() {
    if (this.onStateChange) {
      this.onStateChange({ ...this.gameState })
    }
  }

  public getGameState(): GameState {
    return { ...this.gameState }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close()
    }
  }
}
