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

            if (!this.map.isPaused) {
                setTimeout(function() {
                    requestAnimationFrame(() => {
                            step();
                        })},1000 / 60);
            }
            
        }
        step();
    }

    bindActionInput() {
        new KeyPressListener("Enter", () => {
            //Hay un npc aca para hablar?
            this.map.checkForActionCutscene()
        });

        new KeyPressListener("Escape", () => {
            if (!this.map.isCutscenePlaying) {
                this.map.startCutscene([
                    {type: "pause"}
                ])
            }
        });
    }
    bindHeroPositionCheck() {
        document.addEventListener("PersonWalkingComplete", e => {
            if (e.detail.whoId === "hero") {
                //La posicion del heroe cambio
                this.map.checkForFootstepCutscene()
            }
        })
    }

    startMap(mapConfig, heroInitialState = null){
        this.map = new OverworldMap(mapConfig);
        this.map.overworld = this;
        this.map.mountObjects();

        if (heroInitialState) {
            const {hero} = this.map.gameObjects;
            this.map.removeWall(hero.x, hero.y);
            hero.x = heroInitialState.x;
            hero.y = heroInitialState.y;
            hero.direction = heroInitialState.direction;
            this.map.addWall(hero.x, hero.y);
        }

        this.progress.mapId = mapConfig.id;
        this.progress.startingHeroX = this.map.gameObjects.hero.x;
        this.progress.startingHeroY = this.map.gameObjects.hero.y;
        this.progress.startingHeroDirection = this.map.gameObjects.hero.direction;
    }

    async init () {

        const container = document.querySelector(".game-container");

        //Crea un nuevo Progress tracker
        this.progress = new Progress();

        //Muestra la Title Screen
        this.titleScreen =  new TitleScreen ({
            progress: this.progress
        })
        const useSaveFile = await this.titleScreen.init(container);

        //Carga el Progress guardado, si lo hay
        let initialHeroState = null;
        
        if (useSaveFile) {
            this.progress.load();
            initialHeroState = {
                x: this.progress.startingHeroX,
                y: this.progress.startingHeroY,
                direction: this.progress.startingHeroDirection,
            }
        }

        //Carga el HUD
        this.hud = new Hud();
        this.hud.init(container);

        //Empieza el mapa
        this.startMap(window.OverworldMaps[this.progress.mapId], initialHeroState );

        //Crea los controles
        this.bindActionInput();
        this.bindHeroPositionCheck();


        this.directionInput = new DirectionInput();
        this.directionInput.init();

        //Empieza el juego!
        this.startGameLoop();

        // this.map.startCutscene([
        //     { type: "battle", enemyId: "beth" }
        //     // { type: "changeMap", map: "DemoRoom"}
        //     // { type: "textMessage", text: "Hey, hola amigo!"}
        //     ])

        
    }
}