const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
let gameOver = false;

canvas.width = 65*20;
canvas.height = 64*10; 
// Agrega una variable global para la vida del jugador
let playerLife = 100; // Vida máxima
const maxPlayerLife = 100;
let playerLives = 1; // Número de vidas
let damageCooldown = 0; // Para evitar perder vida varias veces por colisión continua
let Puntuacionmaxima = []; // Puntuación máxima alcanzada

function agregarPuntuacionMaxima(puntos) {
    Puntuacionmaxima.push(puntos);
    // Ordenar la puntuación máxima de mayor a menor
    Puntuacionmaxima.sort((a, b) => b - a);
    // Limitar a las 10 puntuaciones más altas
    if (Puntuacionmaxima.length > 10) {
        Puntuacionmaxima = Puntuacionmaxima.slice(0, 10);
    }
    // Guardar la puntuación máxima en el localStorage
    localStorage.setItem('puntuacionMaxima', JSON.stringify(Puntuacionmaxima
    ));
}


//Primer etapa: Dibuja el elemento canvas y establece su tamaño con su contexto 2D

// Segundo paso: Crea una clase Danger que represente los peligros, con propiedades como posición, tamaño, velocidad y dirección. 
// Incluir métodos para actualizar su posición, detectar colisiones con el jugador y dibujar los peligros en el canvas.

// Tercer paso: Crear una clase Player que represente al jugador, con propiedades como posición, velocidad, ancho y alto. 
// También incluir un método para dibujar al jugador en el canvas y otro para actualizar su posición y aplicar gravedad.

// Cuarto paso: Crear un array de objetos Danger que representen los peligros en el juego, con posiciones aleatorias y tamaños fijos.

// Quinto paso: Implementar un bucle de animación que actualice y dibuje los peligros y al jugador en cada fotograma, y que detecte colisiones entre ellos. 
// Si el jugador colisiona con un peligro, se debe reducir su tamaño y si es demasiado pequeño, se debe mostrar un mensaje de "Game Over" y detener el juego.

// Sexto paso: Implementar controles para mover al jugador hacia la izquierda y derecha, y saltar con la tecla 'w'. 
// El jugador debe poder moverse por el canvas y evitar los peligros que se mueven horizontalmente.

// Séptimo paso: Implementar un sistema de colisiones que detecte cuando el jugador colisiona con un peligro y reduzca su tamaño, y si es demasiado pequeño, 
// se debe mostrar un mensaje de "Game Over" y detener el juego.

// Octavo paso: Implementar un sistema de puntuación que aumente cada vez que el jugador evite un peligro, y que se muestre en la pantalla.
//  Si el jugador colisiona con un peligro, se debe reiniciar la puntuación a cero.

// Noveno paso: Implementar un sistema de reinicio del juego que permita al jugador reiniciar el juego después de un "Game Over".
class Danger {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = 'blue';
        this.speed = Math.random() * 10 + 1; // random speed between 1 and 10
        this.direction = Math.random() < 0.5 ? 1 : -1; // random direction
        // Limitar la velocidad maxima de la clase danger
        if (this.speed > 10) {
        this.speed = 10; // Limita la velocidad máxima a 10
    }
}
    

    update(canvasWidth) {
        // Move horizontally at random speed
        this.x += this.speed * this.direction;
        // Move vertically in a sine wave pattern
        this.y += this.speed * Math.sin(Date.now() / 1000 + this.x / 100) * 0.5; // Adjust the multiplier for vertical movement
        // Keep within canvas bounds
        if (this.y < 0) {
            this.y *= -1; // bounce off top edge
        }
        // Bounce off edges
        if (this.x < 0 || this.x + this.size > canvasWidth) {
            this.direction *= -1;
        }
        // Bounce off top/bottom edges
        if (this.y < 0) {
            this.y *= -1;
            this.y = 0;
        }
        if (this.y + this.size > canvas.height) {
            this.y *= -1;
            this.y = canvas.height - this.size;
        }
    }
    

    checkCollision(player) {
    // Colision detection between player and danger
    // Check if player is within the bounds of the danger square
    if (
        player.position.x < this.x + this.size &&
        player.position.x + player.width > this.x &&
        player.position.y < this.y + this.size &&
        player.position.y + player.height > this.y
    ) {
        if (player.isDodging) {
            // Si está esquivando, elimina este Danger y suma puntos
            this.x = -9999; // Lo "elimina" del canvas (puedes usar otro método si prefieres)
            this.y = -9999;
            puntos += 10;
            elementoPuntos.textContent = `Puntos: ${puntos}`;
        } else {
            this.color = 'white';
            // Solo quita vida si no está en cooldown
            if (damageCooldown <= 0 && playerLife > 0) {
                playerLife -= 20; // Daño por colisión
                if (playerLife < 0) playerLife = 0;
                damageCooldown = 30; // frames de invulnerabilidad
            }
        }
    } else {
        this.color = 'blue';
    }
}

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}
class Player {
    constructor() {
        this.position = {x: 200, y: 100}
        this.velocity = {x: 0, y: 0}
        this.width = 100
        this.height = 100
        this.sides = {bottom: this.position.x + this.height}
        this.gravity = 1
        this.image = new Image();
        this.image.src = 'Assets/player.png'; // Ruta a la imagen del jugador
        // Inicializar la variable para verificar si la imagen está cargada
        this.imageLoaded = false;
        this.image.onload = () => {
            this.onImageLoad();
        };
    }
    onImageLoad() {
        this.imageLoaded = true;
    }
    // Método para dibujar al jugador en el canvas
    draw(){
    // Si está en modo "esquivar" (q), se pone negro
    if (this.isDodging) {
        c.fillStyle = 'black';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    } else if (this.imageLoaded && this.image.complete && this.image.naturalWidth > 0) {
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    } else {
        c.fillStyle = 'red';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
    if (damageCooldown > 0 && !this.isDodging) {
        c.fillStyle = 'yellow';
        c.globalAlpha = 0.5;
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
        c.globalAlpha = 1.0;
    }
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
// Crear una clase Danger que represente los peligros, con propiedades como posición, tamaño, velocidad y dirección. Incluir métodos para actualizar su posición, detectar colisiones con el jugador y dibujar los peligros en el canvas.
// Crear un array de objetos Danger que representen los peligros en el juego, con posiciones aleatorias y tamaños fijos.
const dangers = [];
for (let i = 0; i < 10; i++) {
    // Random positions within canvas
    let x = Math.random() * (canvas.width - 40);
    let y = Math.random() * (canvas.height - 40);
    dangers.push(new Danger(x, y, 40));
}
player.isDodging = false;
let dodgeTimeout = null;

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
    q: {
        pressed: false
    }
}
function drawLifeBar(ctx) {
    const barWidth = 300;
    const barHeight = 25;
    const x = 30;
    const y = 30;
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - 4, y - 4, barWidth + 8, barHeight + 8);
    ctx.fillStyle = '#ccc';
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(x, y, (playerLife / maxPlayerLife) * barWidth, barHeight);
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, barWidth, barHeight);

    // Dibujar vidas debajo de la barra de vida
    const lifeIconRadius = 12;
    const spacing = 15;
    const livesY = y + barHeight + 25;
    for (let i = 0; i < playerLives; i++) {
        ctx.beginPath();
        ctx.arc(x + lifeIconRadius + i * (lifeIconRadius * 2 + spacing), livesY, lifeIconRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    ctx.restore();
}
let puntos = 0;
const elementoPuntos = document.getElementById('puntos'); // Asegúrate de tener un elemento con id="puntos" en tu HTML

function agregarPunto() {
  if (!gameOver) { // Solo suma puntos si el juego no ha terminado
    puntos++;
    elementoPuntos.textContent = `Puntos: ${puntos}`;
  }
}

setInterval(agregarPunto, 1000)
// Llama a agregarPunto cada 1000 ms (1 segundo)
// Función de animación principal

function playerLifeAdd() {
    if (!gameOver && playerLife < maxPlayerLife) {
        playerLife += 10; // Incrementa la vida del jugador
        if (playerLife > maxPlayerLife) playerLife = maxPlayerLife; // Asegúrate de no exceder la vida máxima
    }
}

// Llama a playerLifeAdd cada 5000 ms (5 segundos)
setInterval(playerLifeAdd, 5000);
function animate(){
    window.requestAnimationFrame(animate)
    c.fillStyle = 'white'
    c.fillRect (0, 0, canvas.width, canvas.height)
    c.clearRect(0, 0, canvas.width, canvas.height)

    if (damageCooldown > 0) damageCooldown--;

    player.velocity.x = 0
    if (keys.d.pressed) {player.velocity.x = 5} 
    else if (keys.a.pressed) {player.velocity.x = -5}

    // Manejo de vidas y game over
    if (playerLife <= 0) {
        if (playerLives > 1) {
            playerLives--;
            playerLife = maxPlayerLife;
            damageCooldown = 60; // Pequeño intervalo de invulnerabilidad al revivir
        } else {
            gameOver = true;
        }
    }
        if (puntos >= 135) {
    c.fillStyle = 'green';
    c.font = 'bold 60px Arial';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('¡Victoria!', canvas.width / 2, canvas.height / 2);
    c.fillStyle = 'white';
    c.font = 'bold 40px Arial';
    c.fillText(`Puntuación final: ${puntos}`, canvas.width / 2, canvas.height / 2 + 60);
    updateRetryButtonVisibility();
    gameOver = true; // Detiene el juego y muestra el botón de reinicio
    return;
    }
    if (gameOver) {
        c.fillStyle = 'red';
        c.font = 'bold 60px Arial';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText('Game Over', canvas.width / 2, canvas.height / 2);
        // Mostrar puntos finales en el centro
        c.fillStyle = 'white';
        c.font = 'bold 40px Arial';
        c.fillText(`puntuación final: ${puntos}`, canvas.width / 2, canvas.height / 2 + 60);
        updateRetryButtonVisibility(); // Actualizar visibilidad del botón de reinicio
        return;
    
    }
    // Actualizar y dibujar peligros
    dangers.forEach(danger => {
        danger.update(canvas.width);
        danger.checkCollision(player);
        danger.draw(c);
    });

    player.draw();
    player.update();
    drawLifeBar(c); // Dibuja la barra de vida y las vidas
}// Inicia la animación
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
        //derecha
        break
        case 'q':
            if (!player.isDodging) {
                player.isDodging = true;
                // Desactivar el modo esquivar después de 10ms
                if (dodgeTimeout) clearTimeout(dodgeTimeout);
                dodgeTimeout = setTimeout(() => {
                    player.isDodging = false;
                }, 100);
            }
            break;
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
        //derecha
        break
        case 'q':
        keys.q.pressed = false
        //esquivar
        break
    }
})

// Botón de reinicio del juego
const retryButton = document.querySelector('button');
retryButton.addEventListener('click', () => {
    // Reiniciar variables del juego
    playerLife = maxPlayerLife;
    playerLives = 3;
    gameOver = false;
    puntos = 0;
    elementoPuntos.textContent = `Puntos: ${puntos}`;
    
    // Reiniciar el jugador
    player.position.x = 200;
    player.position.y = 100;
    player.velocity.x = 0;
    player.velocity.y = 0;

    dangers.length = 0;
    for (let i = 0; i < 10; i++) {
        let x = Math.random() * (canvas.width - 40);
        let y = Math.random() * (canvas.height - 40);
        dangers.push(new Danger(x, y, 40));
    }

});
// Asegúrate de que el botón esté visible y tenga un estilo adecuado en tu HTML/CSS
retryButton.style.display = 'block'; // Asegúrate de que el botón esté visible
retryButton.style.position = 'absolute';
retryButton.style.top = '100px';
retryButton.style.left = '961px';
retryButton.style.padding = '10px 20px';
retryButton.style.color = '#fff';
retryButton.style.border = 'none';
retryButton.style.borderRadius = '5px';
retryButton.style.cursor = 'pointer';
retryButton.style.fontSize = '16px';
retryButton.style.zIndex = '1000'; // Asegúrate de que el botón esté por encima de otros elementos
// Asegúrate de que el botón esté oculto al inicio del juego
retryButton.style.display = 'none'; // Ocultar el botón al inicio del juego 
// Mostrar el botón solo cuando el juego haya terminado
retryButton.style.display = gameOver ? 'block' : 'none'; // Mostrar el botón solo si el juego ha terminado
// Actualizar el botón de reinicio cuando el juego termine
function updateRetryButtonVisibility() {
    retryButton.style.display = gameOver ? 'block' : 'none'; // Mostrar el botón solo si el juego ha terminado
}
// Ocultar el botón de reinicio al inicio del juego
updateRetryButtonVisibility(); // Llama a esta función al inicio para asegurarte de que el botón esté oculto (no funciona aun XD)