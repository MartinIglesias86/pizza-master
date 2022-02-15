class Overworld {
    constructor(config) {
        this.element = config.element;
        this.canvas = this.element.querySelector(".game-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.map = null;
    }

    startGameLoop() {
        const step = () => {
            //Limpiar canvas de dibujos anteriores
            this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);

            //Establecer el personaje de la camara
            const cameraPerson = this.map.gameObjects.hero;

            //Update todos los objetos
            Object.values(this.map.gameObjects).forEach(object => {
                object.update({
                    arrow: this.directionInput.direction,
                    map: this.map,
                })
            })

            //Dibuja lower layer
            this.map.drawLowerImage(this.ctx, cameraPerson);
            
            //Dibuja game objects
            Object.values(this.map.gameObjects).sort((a,b) => {
                return a.y - b.y;
            }).forEach(object => {
                object.sprite.draw(this.ctx, cameraPerson);
            })

            //Dibuja upper layer
            this.map.drawUpperImage(this.ctx, cameraPerson);

            
            setTimeout(function() {
                requestAnimationFrame(() => {
                        step();
                    })},1000 / 60);
            
        }
        step();
    }

    bindActionInput() {
        new KeyPressListener("Enter", () => {
            //Hay un npc aca para hablar?
            this.map.checkForActionCutscene()
        })
    }
    bindHeroPositionCheck() {
        document.addEventListener("PersonWalkingComplete", e => {
            if (e.detail.whoId === "hero") {
                //La posicion del heroe cambio
                this.map.checkForFootstepCutscene()
            }
        })
    }

    startMap(mapConfig){
        this.map = new OverworldMap(mapConfig);
        this.map.overworld = this;
        this.map.mountObjects();
    }

    init () {
        this.startMap(window.OverworldMaps.DemoRoom);

        this.bindActionInput();
        this.bindHeroPositionCheck();


        this.directionInput = new DirectionInput();
        this.directionInput.init();
        this.startGameLoop();

        this.map.startCutscene([
            { type: "battle" }
            // { type: "changeMap", map: "DemoRoom"}
            // { type: "textMessage", text: "Hey, hola amigo!"}
            ])

        
    }
}