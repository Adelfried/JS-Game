const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
let gameOver = false;

canvas.width = window.innerWidth -32; // Establece el ancho del canvas al ancho de la ventana
canvas.height = window.innerHeight -32; // Establece la altura del canvas a la altura de la ventana
// Agrega una variable global para la vida del jugador
let playerLife = 100; // Vida máxima
const maxPlayerLife = 100;
let playerLives = 3; // Número de vidas
let damageCooldown = 0; // Para evitar perder vida varias veces por colisión continua
let landSoundCooldown = 0; // Tiempo en frames


//Primer etapa: Dibuja el elemento canvas y establece su tamaño con su contexto 2D

// Segundo paso: Crea una clase Danger que represente los peligros, con propiedades como posición, tamaño, velocidad y dirección. 
// Incluir métodos para actualizar su posición, detectar colisiones con el jugador y dibujar los peligros en el canvas.

// Tercer paso: Crear una clase Player que represente al jugador, con propiedades como posición, velocidad, ancho y alto. 
// También incluir un método para dibujar al jugador en el canvas y otro para actualizar su posición y aplicar gravedad.

// Cuarto paso: Crear un array de objetos Danger que represente los peligros en el juego, con posiciones aleatorias y tamaños fijos.
class Sprite{
    const({animations = [], data}) {
        this.animations = animations;
        this.animation ='idle'
        this.frame = {}
        this.frameIndex = -1;
        this.data = data;
    }
    advance() {
        if(frame % 8 === 0) {
            this.framesNames = this.animations[this.animation].frames;
        }
        if (this.frameIndex + 1 >= this.framesNames.length){
            this.frameIndex = 0
        }else {
            this.frameIndex++;
        }
        this.frame = this.data.frames[this.framesNames[this.frameIndex]].frame
     }
}

class Character extends Sprite {
    constructor(imageURL,x,y,w,h) {
        this.x = x || 200
        this.y = y || 200
        this.w = w || 50
        this.h = h || 50
        this.image = new Image();
        this.image.src = imageURL
}
    
     Dibujar() {
        ctx.drawImage(
            this.image,
            this.frame.x,
            this.frame.y,
            this.frame.w,
            this.frame.h,
            this.x,
            this.y,
            this.w,
            this.h,
        )
    }
}

class Danger {
    constructor(x, size) {
        this.x = x;
        this.y = -size; // Empieza arriba del canvas
        this.size = size;
        this.image = new Image();
        this.image.src = '../Assets/danger.png'; // Cambia la ruta si tienes una imagen
        this.imageLoaded = false;
        this.image.onload = () => { this.imageLoaded = true; };
        this.image.src = '../Assets/image.png';
        this.speed = Math.random() * 12 + 4; // Velocidad aleatoria entre 2 y 8
        this.active = true; // Para saber si debe dibujarse
    }

    update() {
        if (!this.active) return;
        this.y += this.speed;
        // Si toca el suelo, desaparece
        if (this.y - this.size > canvas.height) {
            this.active = false;
        }
    }

    checkCollision(player) {
        if (!this.active) return;
        // Colisión circular vs circular (hitbox centrada en la imagen del jugador)
        const playerCenterX = player.position.x + player.width / 2;
        const playerCenterY = player.position.y + player.height / 2;
        const playerRadius = Math.min(player.width, player.height) / 2 * 0.65; // Ajusta el 0.7 para el tamaño de la hitbox

        const dx = this.x - playerCenterX;
        const dy = this.y - playerCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.size + playerRadius) {
            if (player.isDodging) {
                this.active = false;
                puntos += 10;
                elementoPuntos.textContent = `Puntaje: ${puntos}`;
            } else {
                this.color = 'white';
                if (damageCooldown <= 0 && playerLife > 0) {
                    playerLife -= 20;
                    if (playerLife < 0) playerLife = 0;
                    damageCooldown = 30;
                }
            }
        } else {
            this.color = 'blue';
        }
    }

    draw(ctx) {
        if (!this.active) return;
        ctx.save();
        if (this.imageLoaded && this.image.complete && this.image.naturalWidth > 0) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(this.image, this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
            ctx.restore();
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color || 'blue';
            ctx.fill();
            ctx.restore();
        }
    }
}
class Player {
    constructor() {
        this.position = {x: 300, y: 200}
        this.velocity = {x: 0, y: 0}
        this.width = 70
        this.height = 70
        this.sides = {bottom: this.position.x + this.height}
        this.gravity = 1
        this.image = new Image();
        this.image.src = '../Assets/player.jpg'; // Imagen normal
        this.imageLoaded = false;
        this.image.onload = () => { this.onImageLoad(); };

        // Imagen para esquivar
        this.dodgeImage = new Image();
        this.dodgeImage.src = '../Assets/parry.jpg'; // Cambia por la ruta de tu imagen de esquivar
        this.dodgeImageLoaded = false;
        this.dodgeImage.onload = () => { this.dodgeImageLoaded = true; };
    }
    onImageLoad() {
        this.imageLoaded = true;
    }
    // Método para dibujar al jugador en el canvas
    draw(){
        c.save();
        if (this.flipped) {
            // Girar la imagen 180 grados horizontalmente
            c.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
            c.scale(-1, 1);
            c.translate(-this.width / 2, -this.height / 2);
            if (this.isDodging && this.dodgeImageLoaded && this.dodgeImage.complete && this.dodgeImage.naturalWidth > 0) {
                c.drawImage(this.dodgeImage, 0, 0, this.width, this.height);
            } else if (this.imageLoaded && this.image.complete && this.image.naturalWidth > 0) {
                c.drawImage(this.image, 0, 0, this.width, this.height);
            } else {
                c.fillStyle = 'red';
                c.fillRect(0, 0, this.width, this.height);
            }
        } else {
            // Imagen normal
            if (this.isDodging && this.dodgeImageLoaded && this.dodgeImage.complete && this.dodgeImage.naturalWidth > 0) {
                c.drawImage(this.dodgeImage, this.position.x, this.position.y, this.width, this.height);
            } else if (this.imageLoaded && this.image.complete && this.image.naturalWidth > 0) {
                c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
            } else {
                c.fillStyle = 'red';
                c.fillRect(this.position.x, this.position.y, this.width, this.height);
            }
        }
        if (damageCooldown > 0 && !this.isDodging) {
            c.globalAlpha = 0.5;
            c.fillStyle = 'yellow';
            if (this.flipped) {
                c.fillRect(0, 0, this.width, this.height);
            } else {
                c.fillRect(this.position.x, this.position.y, this.width, this.height);
            }
            c.globalAlpha = 1.0;
        }
        c.restore();
    }

    update (){
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        this.sides.bottom = this.position.y + this.height
        // EFECTO BOUNCE
        // Colisión con el suelo
        if (this.sides.bottom + this.velocity.y < canvas.height){
            this.velocity.y += 0.8;
        } else {
            if (this.velocity.y !== 0 && landSoundCooldown <= 0) {
                landAudio.currentTime = 0.150;
                landAudio.play();
                landSoundCooldown = 50; // Espera 30 frames (~0.5 segundos si usas 60fps)
            }
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

// Crear una clase Player que represente al jugador, con propiedades como posición, velocidad, ancho y alto. 
// También incluir un método para dibujar al jugador en el canvas y otro para actualizar su posición y aplicar gravedad.
const player = new Player ()
// Crear una clase Danger que represente los peligros, con propiedades como posición, tamaño, velocidad y dirección. I
// ncluir métodos para actualizar su posición, detectar colisiones con el jugador y dibujar los peligros en el canvas.

// Crear un array de objetos Danger que representen los peligros en el juego, con posiciones aleatorias y tamaños fijos.
const dangers = [];
function spawnDanger() {
    const size = 40;
    const x = Math.random() * (canvas.width - size * 2) + size;
    dangers.push(new Danger(x, size));
}
setInterval(spawnDanger, 100);
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
    elementoPuntos.textContent = `Puntaje: ${puntos}`;
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
        if (puntos >= 700) {
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
    // Si el juego ha terminado, muestra el mensaje de Game Over y la puntuación final
    // Cuando termina el juego, guarda el récord y actualiza la pantalla
// --- SISTEMA DE RÉCORD SEGURO ---
function guardarRecord(puntos) {
    const recordGuardado = localStorage.getItem('recordMaximo');
    const recordActual = recordGuardado ? parseInt(recordGuardado) : 0;
    if (puntos > recordActual) {
        localStorage.setItem('recordMaximo', puntos);
    }
}

function mostrarRecord() {
    const recordGuardado = localStorage.getItem('recordMaximo');
    const recordActual = recordGuardado ? parseInt(recordGuardado) : 0;
    const recordElemento = document.getElementById('record');
    if (recordElemento) {
        recordElemento.textContent = `Récord: ${recordActual}`;
    }
}

// Llama a mostrarRecord al iniciar el juego
mostrarRecord();
function finalizarJuego() {
    guardarRecord(puntos); // Asegúrate que 'puntos' es tu variable de score
    mostrarRecord();
    updateRetryButtonVisibility();
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
        finalizarJuego(); // Llama a la función para guardar y mostrar el récord
        return;
    
    }
    // Actualizar y dibujar peligros
    dangers.forEach(danger => {
        danger.update();
        danger.checkCollision(player);
        danger.draw(c);
    });

        for (let i = dangers.length - 1; i >= 0; i--) {
        if (!dangers[i].active) dangers.splice(i, 1);
    }

    player.draw();
    player.update();
    drawLifeBar(c); // Dibuja la barra de vida y las vidas

    if (landSoundCooldown > 0) landSoundCooldown--;
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
        player.flipped = true; // Girar a la izquierda
        //izquierda
        break
        case 'd':
        keys.d.pressed = true
        player.flipped = false; // Imagen normal
        //derecha
        break
        case 'q':
            if (!player.isDodging) {
                player.isDodging = true;
                // SONIDO DE ESQUIVAR
                dodgeAudio.currentTime = 0;
                dodgeAudio.play();
                // Desactivar el modo esquivar después de 10ms
                if (dodgeTimeout) clearTimeout(dodgeTimeout);
                dodgeTimeout = setTimeout(() => {
                    player.isDodging = false;
                }, 1000); // Cambia el tiempo según tu preferencia
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

// Botón Retry: solo reinicia la partida
const retryButton = document.querySelector('button:not(#resetRecordButton)');
retryButton.addEventListener('click', () => {
    playerLife = maxPlayerLife;
    playerLives = 3;
    gameOver = false;
    puntos = 0;
    elementoPuntos.textContent = `Puntaje: ${puntos}`;
    // Reinicia posición y velocidad del jugador
    player.position.x = 200;
    player.position.y = 100;
    player.velocity.x = 0;
    player.velocity.y = 0;
    // Reinicia peligros, etc. (si tienes lógica extra)
        dangers.length = 0;
});

// Botón Reiniciar Récord: solo borra el récord
const resetRecordButton = document.getElementById('resetRecordButton');
resetRecordButton.addEventListener('click', () => {
    localStorage.removeItem('recordMaximo');
    mostrarRecord();
});


const pasoAudio = new Audio('../Sound/walking-sound.mp3');
pasoAudio.volume = 1; // Opcional: ajusta el volumen


let pasosTimeout = null;

document.addEventListener('keydown', (event) => {
    if (event.key === 'w') {
        // Detiene el sonido de pasos al saltar
        if (!pasoAudio.paused) {
            pasoAudio.pause();
            pasoAudio.currentTime = 0;
        }
    }
    if (event.key === 'q') {
        // Detiene el sonido de pasos al esquivar
        if (!pasoAudio.paused) {
            pasoAudio.pause();
            pasoAudio.currentTime = 0;
        }
    }
    if (event.key === 'a' || event.key === 'd') {
        // Reproduce el sonido de pasos al moverse
        if (pasoAudio.paused) {
            pasoAudio.currentTime = 0.1; // Reinicia el sonido
            pasoAudio.play();
        }
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'a' || event.key === 'd') {
        // Espera 200ms antes de pausar el sonido (puedes ajustar el tiempo)
        pasosTimeout = setTimeout(() => {
            pasoAudio.pause();
            pasoAudio.currentTime = 0;
        }, 200);
    }
});

const dodgeAudio = new Audio('../Sound/Parry.mp3');
dodgeAudio.volume = 0.5; // Ajusta el volumen si lo deseas

const landAudio = new Audio('../Sound/Sonido-caer.mp3');
landAudio.volume = 0.7; // Ajusta el volumen si lo deseas

