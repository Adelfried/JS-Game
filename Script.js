// Description: Parallax Scrolling Background with Speed Control
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext("2d");
const CANVAS_WIDTH = canvas.width = 800;
const CANVAS_HEIGHT = canvas.height = 700;
// Variable to control game speed
let gameSpeed = 10;
//imagenes del background
const backgroundLayer1 = new Image();
backgroundLayer1.src = "img/f-layer-1.png";
const backgroundLayer2 = new Image();
backgroundLayer2.src = "img/f-layer-2.png";
const backgroundLayer3 = new Image();
backgroundLayer3.src = "img/f-layer-3.png";
const backgroundLayer4 = new Image();
backgroundLayer4.src = "img/f-layer-4.png";
const backgroundLayer5 = new Image();
backgroundLayer5.src = "img/f-layer-5.png";
// Slider para controlar la velocidad del juego
//Asegúrese de que el control deslizante esté configurado en la velocidad inicial del juego.
// HTML: <input type="range" id="slider" min="1" max="20" value="10">
// CSS: #slider { width: 100%; }
const slider = document.getElementById('slider');
slider.value = gameSpeed;
const showGameSpeed = document.getElementById('showGameSpeed');
showGameSpeed.innerHTML = gameSpeed;
slider.addEventListener('change', function(e){
    gameSpeed = e.target.value;
    showGameSpeed.innerHTML = e.target.value;
});
// Layer class para el parallax effect
class Layer {
    // Constructor para inicializar las propiedades de la capa
    // x: posición horizontal de la capa
    // y: posición vertical de la capa (generalmente 0 para un fondo)
    // width: ancho de la capa (ancho del canvas)
    // height: altura de la capa (altura del canvas)
    // image: imagen de la capa que se va a dibujar
    // speedModifier: modificador de velocidad para el efecto parallax 
    // speedModifier: un valor que multiplica la velocidad del juego para cada capa, creando un efecto de profundidad
    // gameSpeed: velocidad del juego, controlada por el slider
    // speed: velocidad de desplazamiento de la capa, calculada a partir de gameSpeed y speedModifier
    constructor(image, speedModifier) {
        this.x = 0;
        this.y = 0;
        this.width = 2400;
        this.height = 700;
        this.image = image;
        this.speedModifier = speedModifier;
        this.speed = gameSpeed * this.speedModifier;
    }
    // update: actualiza la posición de la capa
    // Si la capa se desplaza completamente a la izquierda, se reinicia su posición a la derecha
    // draw: dibuja la imagen de la capa en el canvas
    // Dibuja la imagen dos veces para crear un efecto continuo
    // Si la imagen se mueve completamente fuera del canvas, se reinicia su posición
    update() {
        this.speed = gameSpeed * this.speedModifier;
        if (this.x <= -this.width) {
            this.x = 0;
        }
        this.x = Math.floor(this.x - this.speed);
    }
    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
    }
}

// Crea las instancias de la clase Layer para cada capa del fondo
// Cada capa tiene una imagen y un modificador de velocidad diferente
// Esto permite que las capas se muevan a diferentes velocidades, creando un efecto de profundidad
// con la facilidad de ajustar la velocidad del juego mediante el slider
// Cada capa se añade a un array gameObjects para ser actualizada y dibujada en el bucle de animación
const layer1 = new Layer(backgroundLayer1, 0.2);
const layer2 = new Layer(backgroundLayer2, 0.4);
const layer3 = new Layer(backgroundLayer3, 0.6);
const layer4 = new Layer(backgroundLayer4, 0.8);
const layer5 = new Layer(backgroundLayer5, 1);

const gameObjects = [layer1, layer2, layer3, layer4, layer5];

// Function condicional para iniciar la animación
// onload: se ejecuta cuando la imagen del fondo se ha cargado completamente
backgroundLayer5.onload = function animate() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gameObjects.forEach(object => {
        object.update();
        object.draw();
    });
     // requestAnimationFrame: se utiliza para crear un bucle de animación suave
    requestAnimationFrame(animate);
};