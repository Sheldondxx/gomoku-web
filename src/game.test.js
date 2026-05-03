import { describe, it, expect, beforeEach } from 'vitest'
import { Game } from './game.js'

describe('游戏逻辑测试', () => {
  let game
  let container

  beforeEach(() => {
    container = document.createElement('div')
    game = new Game(container)
  })

  describe('落子正确更新棋盘状态', () => {
    it('黑方先手落子应更新棋盘为1', () => {
      game.handleClick({ clientX: 50, clientY: 50 })
      expect(game.board[0][0]).toBe(1)
    })

    it('落子后应设置lastMove', () => {
      game.handleClick({ clientX: 50, clientY: 50 })
      expect(game.lastMove).toEqual([0, 0])
    })
  })

  describe('checkWin函数正确判定胜负', () => {
    it('横向五连珠应判定获胜', () => {
      const board = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      ]
      // 横向五连珠
      board[0][0] = 1
      board[0][1] = 1
      board[0][2] = 1
      board[0][3] = 1
      board[0][4] = 1
      game.board = board
      const result = game.checkWin(2, 0, 1)
      expect(result).not.toBeNull()
    })

    it('纵向五连珠应判定获胜', () => {
      const board = Array(15).fill(null).map(() => Array(15).fill(0))
      board[0][0] = 1
      board[1][0] = 1
      board[2][0] = 1
      board[3][0] = 1
      board[4][0] = 1
      game.board = board
      const result = game.checkWin(0, 2, 1)
      expect(result).not.toBeNull()
    })

    it('主对角线五连珠应判定获胜', () => {
      const board = Array(15).fill(null).map(() => Array(15).fill(0))
      board[0][0] = 1
      board[1][1] = 1
      board[2][2] = 1
      board[3][3] = 1
      board[4][4] = 1
      game.board = board
      const result = game.checkWin(2, 2, 1)
      expect(result).not.toBeNull()
    })

    it('副对角线五连珠应判定获胜', () => {
      const board = Array(15).fill(null).map(() => Array(15).fill(0))
      board[0][4] = 1
      board[1][3] = 1
      board[2][2] = 1
      board[3][1] = 1
      board[4][0] = 1
      game.board = board
      const result = game.checkWin(2, 2, 1)
      expect(result).not.toBeNull()
    })

    it('不足五子不应判定获胜', () => {
      const board = Array(15).fill(null).map(() => Array(15).fill(0))
      board[0][0] = 1
      board[0][1] = 1
      board[0][2] = 1
      board[0][3] = 1
      game.board = board
      const result = game.checkWin(0, 3, 1)
      expect(result).toBeNull()
    })
  })

  describe('轮流落子交替玩家', () => {
    it('黑方落子后应切换到白方', () => {
      game.handleClick({ clientX: 50, clientY: 50 })
      expect(game.currentPlayer).toBe(2)
    })

    it('白方落子后应切换回黑方', () => {
      game.handleClick({ clientX: 50, clientY: 50 })
      game.handleClick({ clientX: 86, clientY: 86 })
      expect(game.currentPlayer).toBe(1)
    })
  })

  describe('不能在已有棋子位置落子', () => {
    it('不能重复在同位置落子', () => {
      game.handleClick({ clientX: 50, clientY: 50 })
      game.handleClick({ clientX: 50, clientY: 50 })
      let count = 0
      for (let y = 0; y < 15; y++) {
        for (let x = 0; x < 15; x++) {
          if (game.board[y][x] !== 0) count++
        }
      }
      expect(count).toBe(1)
    })

    it('不能覆盖已有棋子', () => {
      game.handleClick({ clientX: 50, clientY: 50 })
      expect(game.board[0][0]).toBe(1)
      game.handleClick({ clientX: 86, clientY: 86 })
      expect(game.board[0][0]).toBe(1)
    })
  })
})

describe('UI交互测试', () => {
  let game
  let container

  beforeEach(() => {
    container = document.createElement('div')
    game = new Game(container)
  })

  describe('点击落子触发正确回调', () => {
    it('点击画布应触发落子', () => {
      game.handleClick({ clientX: 50, clientY: 50 })
      expect(game.board[0][0]).toBe(1)
    })
  })

  describe('重新开始按钮重置游戏状态', () => {
    it('点击重新开始应重置棋盘', () => {
      game.handleClick({ clientX: 50, clientY: 50 })
      game.handleClick({ clientX: 86, clientY: 86 })
      game.initBoard()
      let count = 0
      for (let y = 0; y < 15; y++) {
        for (let x = 0; x < 15; x++) {
          if (game.board[y][x] !== 0) count++
        }
      }
      expect(count).toBe(0)
    })

    it('重新开始后currentPlayer应为1', () => {
      game.handleClick({ clientX: 50, clientY: 50 })
      game.initBoard()
      expect(game.currentPlayer).toBe(1)
    })

    it('重新开始后gameOver应为false', () => {
      game.gameOver = true
      game.initBoard()
      expect(game.gameOver).toBe(false)
    })
  })
})