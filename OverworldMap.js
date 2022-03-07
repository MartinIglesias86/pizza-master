class OverworldMap {
    constructor(config) {
        this.overworld = null;
        this.gameObjects = config.gameObjects;
        this.cutsceneSpaces = config.cutsceneSpaces || {};
        this.walls = config.walls || {};

        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc;

        this.upperImage = new Image();
        this.upperImage.src = config.upperSrc;

        this.isCutscenePlaying = false;
        this.isPaused = false;
    }
    drawLowerImage(ctx, cameraPerson) {
        ctx.drawImage(
            this.lowerImage,
            utils.withGrid(10.5) - cameraPerson.x,
            utils.withGrid(6) - cameraPerson.y
        )
    }

    drawUpperImage(ctx, cameraPerson) {
        ctx.drawImage(
            this.upperImage,
            utils.withGrid(10.5) - cameraPerson.x,
            utils.withGrid(6) - cameraPerson.y
        )
    }

    isSpaceTaken(currentX, currentY, direction) {
        const {x,y} = utils.nextPosition(currentX, currentY, direction);
        return this.walls[`${x},${y}`] || false;
    }

    mountObjects(){
        Object.keys(this.gameObjects).forEach(key => {

            let object = this.gameObjects[key];
            object.id = key;

            //Determina si el objeto se debe montar
            object.mount(this);
        })
    }
    //Cutscene
    async startCutscene(events) {
        this.isCutscenePlaying = true;

        for (let i=0; i < events.length; i++) {
            const eventHandler = new OverworldEvent({
                event: events[i],
                map: this,
            })
            const result =  await eventHandler.init();
            if (result === "LOST_BATTLE") {
                break;
            }
        }

        this.isCutscenePlaying = false;

        //Reinicia los NPCs para que hagan su idle behavior
        Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this))
    }

    checkForActionCutscene() {
        const hero = this.gameObjects["hero"];
        const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
        const match = Object.values(this.gameObjects).find(object => {
            return `${object.x}, ${object.y}` === `${nextCoords.x}, ${nextCoords.y}`
        });
        if (!this.isCutscenePlaying && match && match.talking.length) {

            const relevantScenario = match.talking.find(scenario => {
                return (scenario.required || []).every(sf => {
                    return playerState.storyFlags[sf]
                })
            })

            relevantScenario && this.startCutscene(relevantScenario.events)
        }
    }

    checkForFootstepCutscene() {
        const hero = this.gameObjects["hero"];
        const match = this.cutsceneSpaces[ `${hero.x},${hero.y}` ];
        if (!this.isCutscenePlaying && match) {
            this.startCutscene( match[0].events )
        }
    }

    addWall(x,y){
        this.walls[`${x},${y}`] = true;
    }
    removeWall(x,y){
        delete this.walls[`${x},${y}`];
    }
    moveWall(wasX, wasY, direction) {
        this.removeWall(wasX, wasY);
        const {x,y} = utils.nextPosition(wasX, wasY, direction);
        this.addWall(x,y);
    }
}

window.OverworldMaps = {
    DemoRoom: {
        id: "DemoRoom",
        lowerSrc: "./images/maps/DemoLower.png",
        upperSrc: "./images/maps/DemoUpper.png",
        gameObjects: {
            hero: new Person({
                isPlayerControlled: true,
                x: utils.withGrid(5),
                y: utils.withGrid(6),
            }),
            npcA: new Person({
                x: utils.withGrid(7),
                y: utils.withGrid(9),
                src: "./images/characters/people/npc1.png",
                behaviorLoop: [
                    {type: "stand", direction: "left", time: 800},
                    {type: "stand", direction: "up", time: 1000},
                    {type: "stand", direction: "right", time: 1200},
                    {type: "stand", direction: "up", time: 300},
                ],
                talking: [
                    {
                        required: ["TALKED_TO_ERIO"],
                        events: [
                            { type: "textMessage", text: "Preparate para ser amasijado!", faceHero: "npcA"},
                            { type: "battle", enemyId: "beth" },
                            { type: "addStoryFlag", flag: "DEFEATED_BETH" },
                            { type: "textMessage", text: "Nooooo! Sos inimputable!!!!", faceHero: "npcA"}
                            
                        ]
                    },
                    {
                        events: [
                            { type: "textMessage", text: "Antes que nada deberias hablar con Tony.", faceHero: "npcA"},
                            { type: "textMessage", text: "Lo puedes encontrar junto a la mesa central.", faceHero: "npcA"},
                        ]
                    }
                ]
            }),
            npcB: new Person({
                x: utils.withGrid(8),
                y: utils.withGrid(5),
                src: "./images/characters/people/erio.png",
                talking: [
                    {
                        required: ["TALKED_TO_ERIO"],
                        events: [
                            { type: "textMessage", text: "A combatir entonces!", faceHero: "npcB" },
                            { type: "battle", enemyId: "erio" },
                        ]
                    },
                    {
                    events: [
                        { type: "textMessage", text: "Bienvenido Chef, mi nombre es Tony. Espero disfrute nuestra ciudad.", faceHero: "npcB" },
                        { type: "textMessage", text: "En la Piedra para pizzas podra sumar otra delicia a su libro de recetas.", faceHero: "npcB" },
                        { type: "textMessage", text: "Tambien puede recorrer la ciudad y hablar con sus habitantes.", faceHero: "npcB" },
                        { type: "textMessage", text: "Pero cuidado, algunos tienen muy mal humor y lo desafiaran a un combate culinario sin dudarlo.", faceHero: "npcB" },
                        { type: "textMessage", text: "Si quiere combatir, puede hablar conmigo o con Mica que se encuentra allí", faceHero: "npcB" },
                        { type: "textMessage", text: "Espero que disfrute su estadia!", faceHero: "npcB" },
                        { type: "addStoryFlag", flag: "TALKED_TO_ERIO" },
                    ],
                    }
                    ],
            }),
            pizzaStone: new PizzaStone ({
                x: utils.withGrid(2),
                y: utils.withGrid(7),
                storyFlag: "USED_PIZZA_STONE",
                pizzas: ["v001", "f001"],
            })
        },
        walls: {
            //Mesa
            [utils.asGridCoord(7,6)] : true,
            [utils.asGridCoord(8,6)] : true,
            [utils.asGridCoord(7,7)] : true,
            [utils.asGridCoord(8,7)] : true,
            //Paredes
            [utils.asGridCoord(0,4)] : true,
            [utils.asGridCoord(0,5)] : true,
            [utils.asGridCoord(0,6)] : true,
            [utils.asGridCoord(0,7)] : true,
            [utils.asGridCoord(0,8)] : true,
            [utils.asGridCoord(0,9)] : true,
            [utils.asGridCoord(11,4)] : true,
            [utils.asGridCoord(11,5)] : true,
            [utils.asGridCoord(11,6)] : true,
            [utils.asGridCoord(11,7)] : true,
            [utils.asGridCoord(11,8)] : true,
            [utils.asGridCoord(11,9)] : true,
            [utils.asGridCoord(1,3)] : true,
            [utils.asGridCoord(2,3)] : true,
            [utils.asGridCoord(3,3)] : true,
            [utils.asGridCoord(4,3)] : true,
            [utils.asGridCoord(5,3)] : true,
            [utils.asGridCoord(6,4)] : true,
            [utils.asGridCoord(7,3)] : true,
            [utils.asGridCoord(8,4)] : true,
            [utils.asGridCoord(9,3)] : true,
            [utils.asGridCoord(10,3)] : true,
            [utils.asGridCoord(1,10)] : true,
            [utils.asGridCoord(2,10)] : true,
            [utils.asGridCoord(3,10)] : true,
            [utils.asGridCoord(4,10)] : true,
            [utils.asGridCoord(5,11)] : true, 
            [utils.asGridCoord(6,10)] : true,
            [utils.asGridCoord(7,10)] : true,
            [utils.asGridCoord(8,10)] : true,
            [utils.asGridCoord(9,10)] : true,
            [utils.asGridCoord(10,10)] : true,
        },
        cutsceneSpaces: {
            [utils.asGridCoord(7,4)] : [
                {
                    events: [
                        {who: "npcB", type: "walk", direction: "left"},
                        {who: "npcB", type: "stand", direction: "up", time: 500},
                        {type: "textMessage", text: "Chef, no puede entrar ahi! Por favor retirese!" },
                        {who: "npcB", type: "walk", direction: "right"},
                        {who: "hero", type: "walk", direction: "down"},
                        {who: "hero", type: "walk", direction: "left"},
                    ]
                }
            ],
            [utils.asGridCoord(5,10)]: [
                {
                    events: [
                        {
                            type: "changeMap", 
                            map: "Street",
                            x: utils.withGrid(5),
                            y: utils.withGrid(9), 
                            direction: "down"
                        }
                    ]
                }
            ]
        }
    },
    Kitchen: {
        id: "Kitchen",
        lowerSrc: "./images/maps/KitchenLower.png",
        upperSrc: "./images/maps/KitchenUpper.png",
        gameObjects: {
            hero: new Person({
                isPlayerControlled: true,
                x: utils.withGrid(5),
                y: utils.withGrid(5),
            }),
            npcA: new Person({
                x: utils.withGrid(10),
                y: utils.withGrid(8),
                src: "./images/characters/people/npc3.png",
                talking: [
                    {
                        required: ["TALKED_TO_BRAIAN"],
                        events: [
                            { type: "textMessage", text: "Ya que no entiende que estoy ocupado tendre que derrotarlo!", faceHero: "npcA" },
                            { type: "battle", enemyId: "braian" },
                        ]
                    },
                    {
                        required: ["TALKED_TO_ERIO"],
                        events: [
                            { type: "textMessage", text: "Hola Chef, mi nobre es Braian, encantado de conocerlo", faceHero: "npcA" },
                            { type: "textMessage", text: "En este momento estoy muy ocupado, asi que si me disculpa tengo que seguir trabajando", faceHero: "npcA" },
                            { type: "addStoryFlag", flag: "TALKED_TO_BRAIAN" },
                            {who: "npcA", type: "stand", direction: "down"},
                        ]
                    },
                    {
                        events: [
                            { type: "textMessage", text: "Deberias hablar con Tony, lo encuentras en su cocina", faceHero: "npcA" },
                            {who: "npcA", type: "stand", direction: "down"},
                        ]
                    },
                    
                ]
            }),
        },
        walls: {
            //Mesa1
            [utils.asGridCoord(6,7)] : true,
            [utils.asGridCoord(7,7)] : true,
            //Mesa2
            [utils.asGridCoord(9,7)] : true,
            [utils.asGridCoord(10,7)] : true,
            //Mesa3
            [utils.asGridCoord(9,9)] : true,
            [utils.asGridCoord(10,9)] : true,
            //Mesada
            [utils.asGridCoord(1,5)] : true,
            [utils.asGridCoord(1,6)] : true,
            [utils.asGridCoord(1,7)] : true,
            //Cajas
            [utils.asGridCoord(1,9)] : true,
            [utils.asGridCoord(2,9)] : true,
            //Paredes
            [utils.asGridCoord(0,4)] : true,
            [utils.asGridCoord(0,5)] : true,
            [utils.asGridCoord(0,6)] : true,
            [utils.asGridCoord(0,7)] : true,
            [utils.asGridCoord(0,8)] : true,
            [utils.asGridCoord(0,9)] : true,
            [utils.asGridCoord(13,4)] : true,
            [utils.asGridCoord(13,5)] : true,
            [utils.asGridCoord(13,6)] : true,
            [utils.asGridCoord(13,7)] : true,
            [utils.asGridCoord(13,8)] : true,
            [utils.asGridCoord(13,9)] : true,
            [utils.asGridCoord(1,3)] : true,
            [utils.asGridCoord(2,3)] : true,
            [utils.asGridCoord(3,3)] : true,
            [utils.asGridCoord(4,3)] : true,
            [utils.asGridCoord(5,3)] : true,
            [utils.asGridCoord(6,3)] : true,
            [utils.asGridCoord(7,3)] : true,
            [utils.asGridCoord(8,3)] : true,
            [utils.asGridCoord(9,3)] : true,
            [utils.asGridCoord(10,3)] : true,
            [utils.asGridCoord(11,4)] : true,
            [utils.asGridCoord(12,4)] : true,
            [utils.asGridCoord(1,10)] : true,
            [utils.asGridCoord(2,10)] : true,
            [utils.asGridCoord(3,10)] : true,
            [utils.asGridCoord(4,10)] : true,
            [utils.asGridCoord(5,11)] : true,
            [utils.asGridCoord(6,10)] : true,
            [utils.asGridCoord(7,10)] : true,
            [utils.asGridCoord(8,10)] : true,
            [utils.asGridCoord(9,10)] : true,
            [utils.asGridCoord(10,10)] : true,
            [utils.asGridCoord(11,10)] : true,
            [utils.asGridCoord(12,10)] : true,
        },
        cutsceneSpaces: {
            [utils.asGridCoord(5,10)]: [
                {
                    events: [
                        { 
                            type: "changeMap", 
                            map: "Street",
                            x: utils.withGrid(29),
                            y: utils.withGrid(9), 
                            direction: "down"
                        }
                    ]
                }
            ]
        }
    },
    Street: {
        id: "Street",
        lowerSrc: "./images/maps/StreetLower.png",
        upperSrc: "./images/maps/StreetUpper.png",
        gameObjects: {
            hero: new Person({
            isPlayerControlled: true,
            x: utils.withGrid(30),
            y: utils.withGrid(10),
            }),
            npcA: new Person({
                x: utils.withGrid(6),
                y: utils.withGrid(10),
                src: "./images/characters/people/npc2.png",
                talking: [
                    {
                        required: ["TALKED_TO_ERIO"],
                        events: [
                            { type: "textMessage", text: "Hola Chef, yo soy Yoelys. Estoy esperando probar las pizzas de Tony.", faceHero: "npcA" },
                            { type: "textMessage", text: "El problema es que Mica me da mucho miedo, estoy esperando que ella salga para entrar yo...", faceHero: "npcA" },
                            { type: "textMessage", text: "Por cierto Chef, cuidado con Emi, es el que esta ahi a la derecha.", faceHero: "npcA" },
                            { type: "textMessage", text: 'Parece que quiso "mostrar" una pizza y se le prendio fuego el horno.', faceHero: "npcA" },
                            {who: "npcA", type: "stand", direction: "down"},
                        ]
                    },
                    {
                        events: [
                            { type: "textMessage", text: "Deberias hablar con Tony ahi dentro", faceHero: "npcA" },
                            {who: "npcA", type: "stand", direction: "down"},
                        ]
                    },
                    
                ]
            }),
            npcB: new Person({
                x: utils.withGrid(18),
                y: utils.withGrid(10),
                src: "./images/characters/people/npc5.png",
                behaviorLoop: [
                    {type: "stand", direction: "left", time: 800},
                    {type: "stand", direction: "down", time: 1000},
                    {type: "stand", direction: "left", time: 1200},
                    {type: "stand", direction: "down", time: 800},
                ],
                talking: [
                    {
                        required: ["TALKED_TO_ERIO"],
                        events: [
                            { type: "textMessage", text: "Hola Chef, mi nombre es Emi.", faceHero: "npcB" },
                            { type: "textMessage", text: "Jamas pense que 'console.log(pizza)' me iba a incendiar la cocina!", faceHero: "npcB" },
                            { type: "textMessage", text: "Si Tony se entera se va a enojar mucho conmigo!", faceHero: "npcB" },
                            {who: "npcA", type: "stand", direction: "down"},
                        ]
                    },
                    {
                        events: [
                            { type: "textMessage", text: "Deberias hablar con Tony ahi dentro", faceHero: "npcB" },
                            {who: "npcA", type: "stand", direction: "down"},
                        ]
                    },
                    
                ],
                
            }),
            npcC: new Person({
                x: utils.withGrid(27),
                y: utils.withGrid(11),
                src: "./images/characters/people/npc4.png",
                talking: [
                    {
                        required: ["TALKED_TO_ERIO"],
                        events: [
                            { type: "textMessage", text: "PASEN PASEN A PROBAR LAS MEJORES PIZZAS DE LA CIUDAD, LAS PIZZAS DE BRAIAN!!!.", faceHero: "npcC" },
                            { type: "textMessage", text: "Perdon Chef, no lo reconoci! Mi nombre es Noah", faceHero: "npcC" },
                            { type: "textMessage", text: "Braian me dio trabajo en marketing, asi que estoy tratando de aumentar las ventas", faceHero: "npcC" },
                            { type: "textMessage", text: "Si quiere hablar con Braian lo encuentra dentro de 'Il Muncho Bistro'.", faceHero: "npcC" },
                            { type: "textMessage", text: "LLOREN CHICOS LLOREN PARA QUE MAMÁ LES COMPRE LAS PIZZAS DE BRAIAN!!!", faceHero: "npcC" },
                            {who: "npcC", type: "stand", direction: "down"},
                        ]
                    },
                    {
                        events: [
                            { type: "textMessage", text: "Deberias hablar con Tony, lo puedes encontrar en su cocina.", faceHero: "npcC" },
                            {who: "npcC", type: "stand", direction: "down"},
                        ]
                    },
                    
                ]
            }),
        },
        walls: {
            //Borde izquierdo
            [utils.asGridCoord(3,10)] : true,
            [utils.asGridCoord(3,11)] : true,
            [utils.asGridCoord(3,12)] : true,
            [utils.asGridCoord(3,13)] : true,
            [utils.asGridCoord(3,14)] : true,
            [utils.asGridCoord(3,15)] : true,
            [utils.asGridCoord(3,16)] : true,
            [utils.asGridCoord(3,17)] : true,
            [utils.asGridCoord(3,18)] : true,
            //Toby
            [utils.asGridCoord(5,8)] : true,
            [utils.asGridCoord(4,9)] : true,
            [utils.asGridCoord(6,9)] : true,
            [utils.asGridCoord(7,9)] : true,
            [utils.asGridCoord(8,9)] : true,
            [utils.asGridCoord(9,9)] : true,
            [utils.asGridCoord(10,9)] : true,
            [utils.asGridCoord(11,9)] : true,
            [utils.asGridCoord(12,9)] : true,
            //Borde Superior
            [utils.asGridCoord(13,8)] : true,
            [utils.asGridCoord(14,8)] : true,
            [utils.asGridCoord(15,7)] : true,
            [utils.asGridCoord(16,7)] : true,
            [utils.asGridCoord(17,7)] : true,
            [utils.asGridCoord(18,7)] : true,
            [utils.asGridCoord(19,7)] : true,
            [utils.asGridCoord(20,7)] : true,
            [utils.asGridCoord(21,7)] : true,
            [utils.asGridCoord(22,7)] : true,
            [utils.asGridCoord(23,7)] : true,
            [utils.asGridCoord(24,7)] : true,
            [utils.asGridCoord(24,6)] : true,
            [utils.asGridCoord(24,5)] : true,
            [utils.asGridCoord(25,4)] : true,
            [utils.asGridCoord(25,4)] : true,
            [utils.asGridCoord(26,5)] : true,
            [utils.asGridCoord(26,6)] : true,
            [utils.asGridCoord(26,7)] : true,
            [utils.asGridCoord(27,7)] : true,
            [utils.asGridCoord(28,8)] : true,
            [utils.asGridCoord(28,9)] : true,
            //Bistro
            [utils.asGridCoord(29,8)] : true,
            [utils.asGridCoord(30,9)] : true,
            [utils.asGridCoord(31,9)] : true,
            [utils.asGridCoord(32,9)] : true,
            [utils.asGridCoord(33,9)] : true,
            //Borde derecho
            [utils.asGridCoord(34,10)] : true,
            [utils.asGridCoord(34,11)] : true,
            [utils.asGridCoord(34,12)] : true,
            [utils.asGridCoord(34,13)] : true,
            [utils.asGridCoord(34,14)] : true,
            [utils.asGridCoord(34,15)] : true,
            [utils.asGridCoord(34,16)] : true,
            [utils.asGridCoord(34,17)] : true,
            [utils.asGridCoord(34,18)] : true,
            //Borde inferior
            [utils.asGridCoord(4,19)] : true,
            [utils.asGridCoord(5,19)] : true,
            [utils.asGridCoord(6,19)] : true,
            [utils.asGridCoord(7,19)] : true,
            [utils.asGridCoord(8,19)] : true,
            [utils.asGridCoord(9,19)] : true,
            [utils.asGridCoord(10,19)] : true,
            [utils.asGridCoord(11,19)] : true,
            [utils.asGridCoord(12,19)] : true,
            [utils.asGridCoord(13,19)] : true,
            [utils.asGridCoord(14,19)] : true,
            [utils.asGridCoord(15,19)] : true,
            [utils.asGridCoord(16,19)] : true,
            [utils.asGridCoord(17,19)] : true,
            [utils.asGridCoord(18,19)] : true,
            [utils.asGridCoord(19,19)] : true,
            [utils.asGridCoord(20,19)] : true,
            [utils.asGridCoord(21,19)] : true,
            [utils.asGridCoord(22,19)] : true,
            [utils.asGridCoord(23,19)] : true,
            [utils.asGridCoord(24,19)] : true,
            [utils.asGridCoord(25,19)] : true,
            [utils.asGridCoord(26,19)] : true,
            [utils.asGridCoord(27,19)] : true,
            [utils.asGridCoord(28,19)] : true,
            [utils.asGridCoord(29,19)] : true,
            [utils.asGridCoord(30,19)] : true,
            [utils.asGridCoord(31,19)] : true,
            [utils.asGridCoord(32,19)] : true,
            [utils.asGridCoord(33,19)] : true,
            [utils.asGridCoord(34,19)] : true,
            //Cartel
            [utils.asGridCoord(5,13)] : true,
            [utils.asGridCoord(6,13)] : true,
            [utils.asGridCoord(7,13)] : true,
            [utils.asGridCoord(8,13)] : true,
            //Cantero1
            [utils.asGridCoord(16,9)] : true,
            [utils.asGridCoord(17,9)] : true,
            [utils.asGridCoord(16,10)] : true,
            [utils.asGridCoord(17,10)] : true,
            [utils.asGridCoord(16,11)] : true,
            [utils.asGridCoord(17,11)] : true,
            //Cantero2
            [utils.asGridCoord(25,9)] : true,
            [utils.asGridCoord(26,9)] : true,
            [utils.asGridCoord(25,10)] : true,
            [utils.asGridCoord(26,10)] : true,
            [utils.asGridCoord(25,11)] : true,
            [utils.asGridCoord(26,11)] : true,
            //Mesa de paletas
            [utils.asGridCoord(18,11)] : true,
            [utils.asGridCoord(19,11)] : true,
        },
        cutsceneSpaces: {
            [utils.asGridCoord(29,9)]: [
                {
                    events: [
                        { 
                            type: "changeMap",
                            map: "Kitchen",
                            x: utils.withGrid(5),
                            y: utils.withGrid(10),
                            direction: "up"
                        }
                    ]
                }
            ],
            [utils.asGridCoord(5,9)]: [
                {
                    events: [
                        { 
                            type: "changeMap",
                            map: "DemoRoom",
                            x: utils.withGrid(5),
                            y: utils.withGrid(10),
                            direction: "up"
                        }
                    ]
                }
            ]
        }
    }
}