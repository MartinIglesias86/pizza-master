class GameObject {
    constructor(config) {
        this.id = null;
        this.isMounted = false;
        this.x = config.x || 0;
        this.y = config.y ||0;
        this.direction = config.direction || "down";
        this.sprite = new Sprite ({
            gameObject: this,
            src: config.src || "images/characters/people/hero.png",
        });

        this.behaviorLoop = config.behaviorLoop || [];
        this.behaviorLoopIndex = 0;

        this.talking = config.talking || [];
        
    }

    mount(map) {
        this.isMounted = true;
        map.addWall(this.x, this.y);

        //Si tenemos un behavior, inicia después de un breve retraso
        setTimeout(() => {
            this.doBehaviorEvent(map);
        }, 10)
    }

    update() {

    }

    async doBehaviorEvent(map) {

        //No hacer nada si hay cutscene importante o no tenemos una config para
        //hacer nada
        if (map.isCutscenePlaying || this.behaviorLoop.length === 0 || this.isStanding){
            return;
        }

        //Configurando evento con info relevante
        let eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
        eventConfig.who = this.id;

        //Crear una instancia de evento a partir de la configuración 
        //del próximo evento
        const eventHandler = new OverworldEvent({ map, event: eventConfig });
        await eventHandler.init();

        //Configura el proximo evento para dispararlo
        this.behaviorLoopIndex += 1;
        if (this.behaviorLoopIndex === this.behaviorLoop.length){
            this.behaviorLoopIndex = 0;
        }
        //Do it again!
        this.doBehaviorEvent(map);
    }
}