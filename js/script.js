const output = document.getElementById("output")
const output2 = document.getElementById("output2")
const gameField = document.getElementById("game_field")
const snakeHead = document.getElementById("snake_head")
const apple = document.getElementById("apple")
const left = document.querySelector('.left')
const right = document.querySelector('.right')
const up = document.querySelector('.up')
const down = document.querySelector('.down')
const step = 25
let speed = 150
let windowWidth = window.innerWidth / 1.2
let windowHeight = window.innerHeight / 2
let gameField_width = gameField.clientWidth
let gameField_height = gameField.clientHeight
let apple_posX = getRandomNum(0, gameField_width)
let apple_posY = getRandomNum(0, gameField_height) - step
let posX = step * ~~(gameField_width/(step*2)) - step 
let posY = step * ~~(gameField_height/(step*2)) - step 
let pause = document.getElementById('pause')
let nickname = document.querySelector(".nickname")
let past_posX = []
let past_posY = []
let headAngle = 0
let iteration = 0
let score = 0
let bestScore = localStorage.getItem('bestScore') || 0
let snakeBody
let moveRight
let moveLeft
let moveUp
let moveDown
let bite

// Get and change Nickname
nickname.textContent = localStorage.getItem('nickname')
nickname.addEventListener('click', () => {
    nickname.textContent = prompt("Enter your nickname", localStorage.getItem('nickname'))
    if (nickname.textContent == '') {
        while (nickname.textContent == '') {
            nickname.textContent = prompt("Can't be without a nickname", 'lazy creation')
        }
    }
    localStorage.setItem('bestScore', 0)
    localStorage.setItem('nickname', nickname.textContent)
    nickname.textContent = localStorage.getItem('nickname')
})
if (!localStorage.getItem('nickname')) {
    nickname.textContent = prompt("Enter your nickname")
    if (nickname.textContent == '') {
        while (nickname.textContent == '') {
            nickname.textContent = prompt("Can't be without a nickname", 'lazy creation')
        }
    }
    localStorage.setItem('nickname', nickname.textContent)
    nickname.textContent = localStorage.getItem('nickname')
}

// Menu
const Menu = document.querySelector('.menu')
const MenuButton = document.querySelector('.menu_button')
MenuButton.addEventListener('click', () => {
    Menu.classList.toggle('menu-active')
    if (MenuButton.textContent == 'Close menu') {
        MenuButton.textContent = 'Open menu'
    } else {
        MenuButton.textContent = 'Close menu'
    }
})

// Top players table
const topPlayersTable = document.querySelector('.top_players_table')
const tableClose = document.querySelector('.table_close')
const topPlayersButton = document.querySelector('.top_players_button')
topPlayersButton.addEventListener('click', () => {
    topPlayersTable.classList.toggle('table-active')
    tableClose.classList.toggle('table_close-active')
})
tableClose.addEventListener('click', () => {
    topPlayersTable.classList.toggle('table-active')
    tableClose.classList.toggle('table_close-active')
})

// Settings menu
const settings = document.querySelector('.settings')
const settingsClose = document.querySelector('.settings_close')
const settingsButton = document.querySelector('.settings_button')
settingsButton.addEventListener('click', () => {
    settings.classList.toggle('settings-active')
    settingsClose.classList.toggle('settings_close-active')
})
settingsClose.addEventListener('click', () => {
    settings.classList.toggle('settings-active')
    settingsClose.classList.toggle('settings_close-active')
})
const animateSetting = document.getElementById('animation')
animateSetting.onclick = () => {
    if (animateSetting.checked) {
        if (snakeBody) snakeBody.forEach(elem => {elem.classList.remove('snake_body-noAnimate')})
    } else {
        if (snakeBody) snakeBody.forEach(elem => {elem.classList.add('snake_body-noAnimate')})
    } 
}
const speedRange = document.getElementById('speed')
const speedShow = document.getElementById('speedValue')
speedRange.onchange = () => {
    speedShow.value = speedRange.value
    speed = 350 - (speedRange.value * 50)
    snakeHead.style.transition = `${speed}ms linear`
    if (snakeBody) snakeBody.forEach(elem => {elem.style.transition = `${speed}ms linear`})
}

// Binds menu
const binds = document.querySelector('.binds')
const bindsClose = document.querySelector('.binds_close')
const bindsButton = document.querySelector('.binds_button')
bindsButton.addEventListener('click', () => {
    binds.classList.toggle('binds-active')
    bindsClose.classList.toggle('binds_close-active')
})
bindsClose.addEventListener('click', () => {
    binds.classList.toggle('binds-active')
    bindsClose.classList.toggle('binds_close-active')
})

// fps counter
let frameCount = function _fc(timeStart){
    let now = performance.now();
    let duration = now - timeStart;
    if(duration < 1000){
        _fc.counter++;
    } else {
        _fc.fps = _fc.counter;
        _fc.counter = 0;
        timeStart = now; 
        document.getElementById('fps').innerHTML = 'fps:'+_fc.fps;
    }
    requestAnimationFrame(() => frameCount(timeStart)); 
}
frameCount.counter = 0;
frameCount.fps = 0;
frameCount(performance.now())

// Get and post data from db
const getData = () => {
    fetch('https://snake-c2fe3-default-rtdb.europe-west1.firebasedatabase.app/db.json')
    .then(res => res.json())
    .then(data => {
        // Check and fill db
        let match = data.findIndex(player => player.nickname == localStorage.getItem('nickname'))
        if (match !== -1 && data[match].bestScore < bestScore) {data[match].bestScore = bestScore}
        if (match == -1 && bestScore > 0) {
            let playerObj = {bestScore: bestScore, nickname: localStorage.getItem('nickname')}
            data.push(playerObj)
        }
        // db sort 
        function byField(field) {
            return (a, b) => a[field] > b[field] ? -1 : 1;
        }
        data.sort(byField('bestScore'));
        // Table render
        document.querySelectorAll('tr').forEach(element => {
            element.remove()
        })
        topPlayersTable.insertAdjacentHTML('beforeEnd', `
            <tr>
                <td>Place</td>
                <td>Nick</td>
                <td>Best result</td>
            </tr>
        `)
        data.forEach((player, index) => {
            topPlayersTable.insertAdjacentHTML('beforeEnd', `
                <tr>
                    <td>${++index}</td>
                    <td>${player.nickname}</td>
                    <td>${player.bestScore}</td>
                </tr>
            `)
        })
        // db post
        postData(data)
    })
}
getData()
const postData = (data) => {
    fetch('https://snake-c2fe3-default-rtdb.europe-west1.firebasedatabase.app/', {
        method: 'PUT',
        body: JSON.stringify(data)
    }).then((res) => res.json())
}

function position_update() {
    snakeHead.style.transform = `translate(${posX}px, ${posY}px) rotate(${headAngle}deg)`
    apple.style.transform = `translate(${apple_posX}px, ${apple_posY}px)`
    if (posX == apple_posX && posY == apple_posY) {body_grow(), apple_respawn(), score += 1}
    body_position()
    bestScoreCheck()
    output.value = score
    output2.value = bestScore
}
position_update()

function move_history() {
    iteration += 1
    past_posX[iteration] = posX
    past_posY[iteration] = posY
}
move_history()

function body_grow() {
    if (animateSetting.checked) {
        gameField.insertAdjacentHTML('beforeEnd', '<div class="snake_body"></div>')
    } else {
        gameField.insertAdjacentHTML('beforeEnd', '<div class="snake_body snake_body-noAnimate"></div>')
    } 
    snakeBody = document.querySelectorAll(".snake_body")
    snakeBody.forEach(elem => {elem.style.transition = `${speed}ms linear`})
}

function body_position() {
    if (snakeBody !== undefined) {
        for (let i = 0; i < snakeBody.length; i++) {
            body_posX = past_posX[iteration-i]
            body_posY = past_posY[iteration-i]
            snakeBody[i].style.transform = `translate(${body_posX}px, ${body_posY}px)`
            if (posX == body_posX && posY == body_posY) {bite = 'yes'}
        }
    }
}

function apple_respawn() {
    const randomPosX = getRandomNum(0, gameField_width)
    const randomPosY = getRandomNum(0, gameField_height) - step
    let snakeBodyLength = snakeBody ? snakeBody.length : 0
    let posMatch = false
    for (let i = past_posX.length; i > (past_posX.length - snakeBodyLength); i--) {
        if (randomPosX == past_posX[i] && randomPosY == past_posY[i]) {posMatch = true}
    } 
    if (posMatch == true) {
        apple_respawn()
    } else {
        apple_posX = randomPosX
        apple_posY = randomPosY
    }
}

function bestScoreCheck() {
    if (score > bestScore) {bestScore = score, localStorage.setItem('bestScore', bestScore), getData()}
}

function getRandomNum(min, max) {
    max = (max - step) / step;
    return (Math.floor(Math.random() * (max - min + 1)) + min) * step;
}

function dead_check() {
    if (posX >= gameField_width || posX < 0 || posY < -step || posY >= (gameField_height - step)) {
        return true
    }
}

function dead() {
    if (dead_check() || bite) {
        if (snakeBody !== undefined) {
            snakeBody.forEach(element => {
                element.remove()
            })
        }
        clearIntervals()
        posX = step * ~~(gameField_width/(step*2)) - step
        posY = step * ~~(gameField_height/(step*2)) - step 
        body_posX = []
        body_posY = []
        bite = undefined
        snakeBody = undefined
        score = 0
    }
}

function clearIntervals() {
    document.querySelector('.control').style.display = 'none'
    clearInterval(moveLeft)
    clearInterval(moveRight)
    clearInterval(moveUp)
    clearInterval(moveDown)
}

function moveRight_func() {posX += step, pause.value = '', dead(), position_update(), move_history()}
function moveLeft_func()  {posX -= step, pause.value = '', dead(), position_update(), move_history()}
function moveUp_func()    {posY -= step, pause.value = '', dead(), position_update(), move_history()}
function moveDown_func()  {posY += step, pause.value = '', dead(), position_update(), move_history()}

// Controls
left.addEventListener('click', () => {
    if (headAngle !== -90) {
        clearIntervals()
        headAngle = 90
        moveLeft = setInterval(() => moveLeft_func(), speed)
    }
})
right.addEventListener('click', () => {
    if (headAngle !== 90) {
        clearIntervals()
        headAngle = -90
        moveRight = setInterval(() => moveRight_func(), speed)
    }
})
up.addEventListener('click', () => {
    if (headAngle !== 0) {
        clearIntervals()
        headAngle = 180
        moveUp = setInterval(() => moveUp_func(), speed)
    }
})
down.addEventListener('click', () => {
    if (headAngle !== 180) {
        clearIntervals()
        headAngle = 0
        moveDown = setInterval(() => moveDown_func(), speed)
    }
})
gameField.addEventListener('click', () => {
    clearIntervals()
    if (pause.value == '') {
        pause.value = 'Pause'
    } else {
        pause.value = ''
        switch(headAngle) {
            case -90:
                moveRight = setInterval(() => {moveRight_func()}, speed)
                break
            case 90:
                moveLeft = setInterval(() => {moveLeft_func()}, speed)
                break
            case 180:
                moveUp = setInterval(() => {moveUp_func()}, speed)
                break
            case 0:
                moveDown = setInterval(() => {moveDown_func()}, speed)
                break
            default:
        }
    }
})
document.addEventListener('keydown', function(event) {
    if (event.code == 'ArrowLeft' || event.code == 'KeyA') {left.click()}
    if (event.code == 'ArrowRight' || event.code == 'KeyD') {right.click()}
    if (event.code == 'ArrowUp' || event.code == 'KeyW') {up.click()}
    if (event.code == 'ArrowDown' || event.code == 'KeyS') {down.click()}
    if (event.code == 'Space' || event.code == 'KeyP') {gameField.click()}
})

function autoPlay(apple_posX, apple_posY, posX, posY) {
    let targetX = apple_posX
    let targetY = apple_posY
    let curLocX = posX
    let curLocY = posY
    if (curLocX > targetX && headAngle != 90 && curLocY != targetY) left.click()
    if (curLocX < targetX && headAngle != -90 && curLocY != targetY) right.click()
    if (curLocY > targetY && headAngle != 180 && curLocX == targetX) up.click()
    if (curLocY < targetY && headAngle != 0 && curLocX == targetX) down.click()
}

let abraCadabra = 0
document.querySelector('h1').addEventListener('click', function () {
    abraCadabra += 1
    if (abraCadabra === 6) setInterval(() => {autoPlay(apple_posX, apple_posY, posX, posY)}, 20)
});
