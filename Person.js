class Person extends GameObject {
    constructor(config) {
        super(config);
        this.movingProgressRemaining = 0;
        this.isStanding = false;

        this.isPlayerControlled = config.isPlayerControlled || false;

        this.directionUpdate = {
            "up": ["y", -1],
            "down": ["y", 1],
            "left": ["x", -1],
            "right": ["x", 1],
        }
    }

    update(state) {
        if (this.movingProgressRemaining > 0) {
            this.updatePosition();
        }else {
            //Estamos keyword ready y tenemos una flecha presionada
            if ( !state.map.isCutscenePlaying && this.isPlayerControlled && state.arrow) {
                this.startBehavior(state, {
                    type: "walk", 
                    direction: state.arrow
                })
            }
            this.updateSprite(state);    
        }
    }

    startBehavior(state, behavior) {
        //Setear la direccion del personaje a lo que tenga "behavior"
        this.direction = behavior.direction;
        if (behavior.type === "walk") {
            //Frena aca si el espacio no esta libre
            if (state.map.isSpaceTaken(this.x, this.y, this.direction)){
                behavior.retry &&setTimeout(() => {
                    this.startBehavior(state, behavior)
                }, 10);
                return;
            }
            //Listo para caminar!
            state.map.moveWall(this.x, this.y, this.direction);
            this.movingProgressRemaining = 16;
            this.updateSprite(state);
        }

        if (behavior.type === "stand") {
            this.isStanding = true;
            setTimeout(() => {
                utils.emitEvent("PersonStandComplete", {
                    whoId: this.id
                })
                this.isStanding = false;
            }, behavior.time)
        }
    }

    updatePosition() {
            const [property, change] = this.directionUpdate[this.direction]
            this[property] += change; 
            this.movingProgressRemaining -= 1;

            if (this.movingProgressRemaining === 0) {
                //Terminamos de caminar!
                utils.emitEvent("PersonWalkingComplete", {
                    whoId: this.id
                })
            }
    }

    updateSprite() {
        if (this.movingProgressRemaining > 0) {
            this.sprite.setAnimation("walk-"+this.direction);
            return;
        }
        this.sprite.setAnimation("idle-"+this.direction);
    }
}