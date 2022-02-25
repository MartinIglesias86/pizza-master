(function () {
    swal("Bienvenido!", "Utilizas las flechas del teclado o las teclas WASD para moverte, la tecla 'Enter' para interactuar y la tecla 'ESC' para abrir el menu!", "success", {
        button: "A JUGAR!!!",
    });
    const overworld = new Overworld({
        element: document.querySelector(".game-container")
    });
    overworld.init();
})();
