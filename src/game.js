/**
 * 五子棋游戏核心类
 * 游戏常量配置
 */
const GRID_SIZE = 15          // 棋盘格数
const CELL_SIZE = 36          // 每格像素大小
const PIECE_RADIUS = 15       // 棋子半径
const PADDING = 30            // 棋盘边距

/**
 * 五子棋游戏类
 */
export class Game {
    constructor(container) {
        this.container = container
        this.board = []
        this.currentPlayer = 1
        this.gameOver = false
        this.lastMove = null
        this.winLine = null
        this.hoverPos = null
        
        this.initUI()
        this.initBoard()
        this.bindEvents()
    }
    
    /**
     * 初始化UI结构
     */
    initUI() {
        this.container.innerHTML = `
            <h1>五子棋</h1>
            <div class="game-container">
                <canvas id="gameCanvas"></canvas>
                <div class="info-panel">
                    <div class="current-player">
                        <span>当前回合:</span>
                        <div id="playerIndicator" class="player-indicator black"></div>
                        <span id="statusText">黑方</span>
                    </div>
                    <button id="restartBtn" class="btn">重新开始</button>
                </div>
            </div>
            <div id="winOverlay" class="win-overlay">
                <div id="winMessage" class="win-message"></div>
                <button id="playAgainBtn" class="btn">再来一局</button>
            </div>
        `
        
        // 获取DOM元素
        this.canvas = document.getElementById('gameCanvas')
        this.ctx = this.canvas.getContext('2d')
        this.indicator = document.getElementById('playerIndicator')
        this.statusText = document.getElementById('statusText')
        this.winOverlay = document.getElementById('winOverlay')
        this.winMessage = document.getElementById('winMessage')
        
        // 设置画布尺寸 - 确保能容纳整个棋盘网格
        const gridSize = (GRID_SIZE - 1) * CELL_SIZE
        const canvasSize = PADDING * 2 + gridSize
        this.canvas.width = canvasSize
        this.canvas.height = canvasSize
    }
    
    /**
     * 初始化棋盘
     */
    initBoard() {
        this.board = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0))
        this.currentPlayer = 1
        this.gameOver = false
        this.lastMove = null
        this.winLine = null
        this.updateUI()
        this.draw()
    }
    
    /**
     * 更新界面显示
     */
    updateUI() {
        this.indicator.className = `player-indicator ${this.currentPlayer === 1 ? 'black' : 'white'}`
        this.statusText.textContent = this.currentPlayer === 1 ? '黑方' : '白方'
        this.winOverlay.classList.remove('show')
    }
    
    /**
     * 绘制棋盘网格
     */
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)'
        this.ctx.lineWidth = 1
        
        for (let i = 0; i < GRID_SIZE; i++) {
            // 横线
            const y = PADDING + i * CELL_SIZE
            this.ctx.beginPath()
            this.ctx.moveTo(PADDING, y)
            this.ctx.lineTo(PADDING + (GRID_SIZE - 1) * CELL_SIZE, y)
            this.ctx.stroke()
            
            // 竖线
            const x = PADDING + i * CELL_SIZE
            this.ctx.beginPath()
            this.ctx.moveTo(x, PADDING)
            this.ctx.lineTo(x, PADDING + (GRID_SIZE - 1) * CELL_SIZE)
            this.ctx.stroke()
        }
        
        // 绘制星位
        const starPoints = [[3,3], [3,11], [7,7], [11,3], [11,11]]
        this.ctx.fillStyle = 'rgba(0, 212, 255, 0.6)'
        starPoints.forEach(([x, y]) => {
            this.ctx.beginPath()
            this.ctx.arc(PADDING + x * CELL_SIZE, PADDING + y * CELL_SIZE, 4, 0, Math.PI * 2)
            this.ctx.fill()
        })
    }
    
    /**
     * 绘制单个棋子
     */
    drawPiece(x, y, player, isLastMove = false) {
        const cx = PADDING + x * CELL_SIZE
        const cy = PADDING + y * CELL_SIZE
        
        const gradient = this.ctx.createRadialGradient(
            cx - 4, cy - 4, 2, cx, cy, PIECE_RADIUS
        )
        
        if (player === 1) {
            gradient.addColorStop(0, '#555')
            gradient.addColorStop(0.5, '#222')
            gradient.addColorStop(1, '#111')
        } else {
            gradient.addColorStop(0, '#fff')
            gradient.addColorStop(0.5, '#ddd')
            gradient.addColorStop(1, '#bbb')
        }
        
        this.ctx.beginPath()
        this.ctx.arc(cx, cy, PIECE_RADIUS, 0, Math.PI * 2)
        this.ctx.fillStyle = gradient
        this.ctx.fill()
        
        this.ctx.strokeStyle = player === 1
            ? 'rgba(255, 255, 255, 0.3)'
            : 'rgba(255, 255, 255, 0.6)'
        this.ctx.lineWidth = 1
        this.ctx.stroke()
        
        // 最后落子标记
        if (isLastMove) {
            this.ctx.beginPath()
            this.ctx.arc(cx, cy, PIECE_RADIUS + 3, 0, Math.PI * 2)
            this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.8)'
            this.ctx.lineWidth = 2
            this.ctx.stroke()
        }
    }
    
    /**
     * 绘制获胜连线
     */
    drawWinLine() {
        if (!this.winLine) return
        
        const [start, end] = this.winLine
        const x1 = PADDING + start[0] * CELL_SIZE
        const y1 = PADDING + start[1] * CELL_SIZE
        const x2 = PADDING + end[0] * CELL_SIZE
        const y2 = PADDING + end[1] * CELL_SIZE
        
        this.ctx.beginPath()
        this.ctx.moveTo(x1, y1)
        this.ctx.lineTo(x2, y2)
        this.ctx.strokeStyle = 'rgba(0, 255, 150, 0.9)'
        this.ctx.lineWidth = 4
        this.ctx.lineCap = 'round'
        this.ctx.stroke()
        
        this.ctx.shadowColor = '#00ff96'
        this.ctx.shadowBlur = 15
        this.ctx.stroke()
        this.ctx.shadowBlur = 0
    }
    
    /**
     * 绘制提示光标
     */
    drawHoverHint(x, y) {
        if (this.gameOver || this.board[y][x] !== 0) return
        
        const cx = PADDING + x * CELL_SIZE
        const cy = PADDING + y * CELL_SIZE
        
        this.ctx.beginPath()
        this.ctx.arc(cx, cy, PIECE_RADIUS + 2, 0, Math.PI * 2)
        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)'
        this.ctx.lineWidth = 2
        this.ctx.setLineDash([4, 4])
        this.ctx.stroke()
        this.ctx.setLineDash([])
    }
    
    /**
     * 主绘制函数
     */
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#0d1520'
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        
        // 绘制网格
        this.drawGrid()
        
        // 绘制所有棋子
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (this.board[y][x] !== 0) {
                    const isLastMove = this.lastMove &&
                        this.lastMove[0] === x && this.lastMove[1] === y
                    this.drawPiece(x, y, this.board[y][x], isLastMove)
                }
            }
        }
        
        // 绘制获胜连线
        if (this.winLine) {
            this.drawWinLine()
        }
    }
    
    /**
     * 点击落子
     */
    handleClick(e) {
        if (this.gameOver) return
        
        const rect = this.canvas.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const clickY = e.clientY - rect.top
        
        const x = Math.round((clickX - PADDING) / CELL_SIZE)
        const y = Math.round((clickY - PADDING) / CELL_SIZE)
        
        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return
        if (this.board[y][x] !== 0) return
        
        // 落子
        this.board[y][x] = this.currentPlayer
        this.lastMove = [x, y]
        
        // 检查获胜
        const win = this.checkWin(x, y, this.currentPlayer)
        if (win) {
            this.gameOver = true
            this.winLine = win
            this.showWinMessage(this.currentPlayer)
        } else {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1
            this.updateUI()
        }
        
        this.draw()
    }
    
    /**
     * 鼠标移动处理
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const clickY = e.clientY - rect.top
        
        const x = Math.round((clickX - PADDING) / CELL_SIZE)
        const y = Math.round((clickY - PADDING) / CELL_SIZE)
        
        if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
            this.hoverPos = [x, y]
        } else {
            this.hoverPos = null
        }
        
        this.draw()
        if (this.hoverPos && !this.gameOver && this.board[this.hoverPos[1]][this.hoverPos[0]] === 0) {
            this.drawHoverHint(this.hoverPos[0], this.hoverPos[1])
        }
    }
    
    /**
     * 鼠标离开处理
     */
    handleMouseLeave() {
        this.hoverPos = null
        this.draw()
    }
    
    /**
     * 检查获胜
     */
    checkWin(x, y, player) {
        const directions = [
            [[1, 0], [-1, 0]],   // 横向
            [[0, 1], [0, -1]],   // 纵向
            [[1, 1], [-1, -1]], // 主对角线
            [[1, -1], [-1, 1]]  // 副对角线
        ]
        
        for (const [dir1, dir2] of directions) {
            let count = 1
            let startX = x, startY = y
            let endX = x, endY = y
            
            // 正向检查
            let dx = dir1[0], dy = dir1[1]
            for (let i = 1; i < 5; i++) {
                const nx = x + dx * i
                const ny = y + dy * i
                if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && this.board[ny][nx] === player) {
                    count++
                    endX = nx
                    endY = ny
                } else break
            }
            
            // 反向检查
            dx = dir2[0]; dy = dir2[1]
            for (let i = 1; i < 5; i++) {
                const nx = x + dx * i
                const ny = y + dy * i
                if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && this.board[ny][nx] === player) {
                    count++
                    startX = nx
                    startY = ny
                } else break
            }
            
            if (count >= 5) {
                return [[startX, startY], [endX, endY]]
            }
        }
        return null
    }
    
    /**
     * 显示获胜信息
     */
    showWinMessage(player) {
        const winner = player === 1 ? '黑方' : '白方'
        this.winMessage.textContent = `${winner}获胜!`
        this.winMessage.className = `win-message ${player === 1 ? 'black' : 'white'}`
        this.winOverlay.classList.add('show')
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e))
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e))
        this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave())
        document.getElementById('restartBtn').addEventListener('click', () => this.initBoard())
        document.getElementById('playAgainBtn').addEventListener('click', () => this.initBoard())
    }
    
    /**
     * 启动游戏
     */
    start() {
        this.draw()
    }
}
