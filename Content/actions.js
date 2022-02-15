window.Actions = {
    damage1: {
        name: "Whomp!",
        description: "Golpe de masa esponjosa",
        success: [
            { type: "textMessage", text: "{CASTER} uso {ACTION}!"},
            { type: "animation", animation: "spin"},
            { type: "stateChange", damage: 10},
        ]
    },
    saucyStatus: {
        name: "Chorro de salsa",
        description: "Te pone re picanton",
        targetType: "friendly",
        success: [
            { type: "textMessage", text: "{CASTER} uso {ACTION}!"},
            { type: "stateChange", status: { type: "picanton", expiresIn: 3 }},
        ]
    },
    clumsyStatus: {
        name: "Aceite de oliva",
        description: "Delicioso y resbaladizo desorden",
        success: [
            { type: "textMessage", text: "{CASTER} uso {ACTION}!"},
            {type: "animation", animation: "glob", color: "#DFD855"},
            { type: "stateChange", status: { type: "atontado", expiresIn: 3 }},
            { type: "textMessage", text: "{TARGET} esta todo resbaloso!"},
        ]
    },

    //Nueva seccion para items
    item_recoverStatus: {
        name: "Lampara de calor",
        description: "Te mantiene calentita y crocante",
        targetType: "friendly",
        success: [
            { type: "textMessage", text: "{CASTER} uso una {ACTION}!"},
            { type: "stateChange", status: null},
            { type: "textMessage", text: "{CASTER} esta como recien hecha!",},
        ]
    },
    item_recoverHp: {
        name: "Parmesano",
        description: "NUNCA es demasiado queso!",
        targetType: "friendly",
        success: [
            { type:"textMessage", text: "{CASTER} espolvorea un poco de {ACTION}!", },
            { type:"stateChange", recover: 10, },
            { type:"textMessage", text: "{CASTER} recupera HP!", },
        ]
    },
    
}