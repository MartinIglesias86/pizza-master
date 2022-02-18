window.PizzaTypes = {
    normal: "normal",
    spicy: "spicy",
    veggie: "veggie",
    fungi: "fungi",
    chill: "chill",
}

window.Pizzas = {
    "s001":{
        name: "Slice Samurai",
        description: "Tiempo de ver quien corta a quien ¬¬",
        type: PizzaTypes.spicy,
        src: "pizza-master/images/characters/pizzas/s001.png",
        icon: "pizza-master/images/icons/spicy.png",
        actions: [ "damage1", "saucyStatus", "clumsyStatus" ],
    },
    "s002": {
        name: "Brigada Panceta",
        description: "Un intrepido guerrero salado",
        type: PizzaTypes.spicy,
        src: "pizza-master/images/characters/pizzas/s002.png",
        icon: "pizza-master/images/icons/spicy.png",
        actions: [ "damage1", "saucyStatus", "clumsyStatus" ],
    },
    "v001":{
        name: "Vegganita",
        description: "Soy vegan nivel 5, no contengo nada que produzca sombra",
        type: PizzaTypes.veggie,
        src: "pizza-master/images/characters/pizzas/v001.png",
        icon: "pizza-master/images/icons/veggie.png",
        actions: [ "damage1" ],
    },
    "f001":{
        name: "Portobello Express",
        description: "A Mario le funcionan los hongos",
        type: PizzaTypes.fungi,
        src: "pizza-master/images/characters/pizzas/f001.png",
        icon: "pizza-master/images/icons/fungi.png",
        actions: [ "damage1" ],
    },
}