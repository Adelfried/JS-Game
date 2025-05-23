console.log("script.js loaded");

// Para que el canvas ocupe toda la pantalla
var canvas = document.querySelector("canvas");
console.log(canvas);
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


