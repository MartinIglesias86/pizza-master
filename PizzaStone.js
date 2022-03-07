class PizzaStone extends GameObject {
    constructor (config) {
        super(config);
        this.sprite = new Sprite({
            gameObject: this,
            src: "./images/characters/pizza-stone.png",
            animations: {
                "used-down"   : [ [0,0] ],
                "unused-down" : [ [1,0] ],
            },
            currentAnimation: "used-down"
        });
        this.storyFlag = config.storyFlag;

        this.pizzas = config.pizzas;

        this.talking = [
            {
                required: [this.storyFlag],
                events: [
                    { type: "textMessage", text: "Ya usaste esta piedra."},
                ]
            },
            {
                required: ["TALKED_TO_ERIO"],
                events: [
                    { type: "textMessage", text: 'Encontraste la legendaria "Piedra para pizzas"'},
                    { type: "craftingMenu", pizzas: this.pizzas },
                    { type: "addStoryFlag", flag: this.storyFlag },
                ]
            },
            {
                events: [
                    { type: "textMessage", text: "Como Chef reconoces que esto es una Piedra para pizzas."},
                    { type: "textMessage", text: "Esto se ve util, mejor le pregunto a Tony antes de tocar."},
                ]
            }
        ]
    }
    update() {
        this.sprite.currentAnimation = playerState.storyFlags[this.storyFlag]
        ? "used-down"
        : "unused-down"
    }
}