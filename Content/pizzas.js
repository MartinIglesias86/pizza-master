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
        src: "/images/characters/pizzas/s001.png",
        icon: "/images/icons/spicy.png",
        actions: [ "damage1", "saucyStatus", "clumsyStatus" ],
    },
    "s002": {
        name: "Brigada Panceta",
        description: "Un intrepido guerrero salado",
        type: PizzaTypes.spicy,
        src: "/images/characters/pizzas/s002.png",
        icon: "/images/icons/spicy.png",
        actions: [ "damage1", "saucyStatus", "clumsyStatus" ],
    },
    "v001":{
        name: "Octopizza",
        description: "He visto suficiente hentai...",
        type: PizzaTypes.veggie,
        src: "/images/characters/pizzas/v001.png",
        icon: "/images/icons/veggie.png",
        actions: [ "damage1" ],
    },
    "f001":{
        name: "Portobello Express",
        description: "A Mario le funcionan los hongos",
        type: PizzaTypes.fungi,
        src: "/images/characters/pizzas/f001.png",
        icon: "/images/icons/fungi.png",
        actions: [ "damage1" ],
    },
}