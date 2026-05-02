// 五子棋游戏主入口
import './style.css'
import { Game } from './game.js'

// 初始化游戏
const app = document.getElementById('app')
const game = new Game(app)
game.start()
