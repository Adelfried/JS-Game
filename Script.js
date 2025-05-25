var canvas = document.querySelector("canvas");
var c = canvas.getContext("2d");

const CANVASWIDTH = canvas.width = 64*16;
const CANVASHEIGHT = canvas.height = 64*9;

class Player {
    constructor() {
    this.position = {
        x: 100,
        y: 100
        }
        this.velocity = {
            x: 0,
            y: 0,
        }

        this.width = 90
        this.height = 90
        this.sides = {
            bottom: this.position.y + this.height
        }
        this.gravity = 1
    }
    draw(){
        c.fillStyle = 'blue'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
    update (){
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        this.sides.bottom = this.position.y + this.height
        //above bottom of canvas
        if (this.sides.bottom + this.velocity.y < canvas.height){
            this.velocity.y += 0.7
            
        }
        else this.velocity.y = 0
    }
}

const player = new Player ()

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
}
function animate(){
    window.requestAnimationFrame(animate)
    c.fillStyle = 'white'
    c.fillRect (0, 0, canvas.width, canvas.height)
    c.clearRect(0, 0, canvas.width, canvas.height)

    player.velocity.x = 0
    if (keys.d.pressed) {player.velocity.x = 5} 
    else if (keys.a.pressed) {player.velocity.x = -5}

    player.draw()
    player.update()
}

animate ()

window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w':
          if (player.velocity.y === 0)
            player.velocity.y = -20

        break
        case 'a':
        keys.a.pressed = true
        //izquierda
        break
        case 'd':
        keys.d.pressed = true
    }

})

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'a':
        keys.a.pressed = false
        //izquierda
        break
        case 'd':
        keys.d.pressed = false
    }

})
