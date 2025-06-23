var canvas = document.querySelector("canvas");
var c = canvas.getContext("2d");

canvas.width = 65*20;
canvas.height = 64*10; //Primer etapa: Dibuja el elemento canvas y establece su tamaño con su contexto 2D

class Player {
    constructor() {
    this.position = {x: 200, y: 100}
        this.velocity = {x: 0, y: 0}
        this.width = 100
        this.height = 100
        this.sides = {bottom: this.position.x + this.height}
        this.gravity = 1
        this.image = new Image()
        this.image.src = '../Assets/pato.gif'
         // Cargar la imagen del jugador
    }
    draw(){
        c.drawImage(this.image,
             this.position.x,
             this.position.y,
             this.width,
             this.height)
        // c.fillStyle = 'red'
        // c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
    update (){
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        this.sides.bottom = this.position.y + this.height
// EFECTO BOUNCE
        // Colisión con el suelo
        if (this.sides.bottom + this.velocity.y < canvas.height){
            this.velocity.y += 1;
        } else {
            this.velocity.y *= -0.3; // Rebote y pérdida de energía
            this.position.y = canvas.height - this.height;

            // Si la velocidad es muy pequeña, detenemos el rebote
            if (Math.abs(this.velocity.y) < 1) {
                this.velocity.y = 0;
            }
        }
// COLISIONES CON LAS PAREDES
        // Colisión con la pared izquierda
        if (this.position.x < 0) {
            this.position.x = 0;
        }

        // Colisión con la pared derecha
        if (this.position.x + this.width > canvas.width) {
            this.position.x = canvas.width - this.width;
        }
    }
} 
// Crear una clase Player que represente al jugador, con propiedades como posición, velocidad, ancho y alto. También incluir un método para dibujar al jugador en el canvas y otro para actualizar su posición y aplicar gravedad.
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
