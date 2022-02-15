class SubmissionMenu {
    constructor ({ caster, enemy, onComplete, items, replacements }) {
        this.caster = caster;
        this.enemy = enemy;
        this.replacements = replacements;
        this.onComplete = onComplete;

        let quantityMap = {};
        items.forEach(item => {
            if (item.team === caster.team) {
                let existing = quantityMap[item.actionId];
                if (existing) {
                    existing.quantity += 1;
                } else {
                    quantityMap[item.actionId] = {
                    actionId: item.actionId,
                    quantity: 1,
                    instanceId: item.instanceId,
                }
            }
            }
        })
    this.items = Object.values(quantityMap);
    }

    //Construccion de opciones
    getPages() {

        const backOption = {
            label: "Volver atras",
            description: "Vuelve a la pagina anterior",
            handler: () => {
                this.keyboardMenu.setOptions(this.getPages().root)
            }
        };

        return {
            root: [
                {
                    label: "Ataque",
                    description: "Elige un ataque",
                    handler: () => {
                        //Hace algo cuando se elige...
                        this.keyboardMenu.setOptions( this.getPages().attacks );
                    }
                },
                {
                    label: "Items",
                    description: "Elige un Item",
                    handler: () => {
                        //Ir a la pagina de items
                        this.keyboardMenu.setOptions( this.getPages().items );
                    }
                },
                {
                    label: "Cambiar pizza",
                    description: "Cambia tu pizza por otra",
                    handler: () => {
                        //Ver las pizzas disponibles
                        this.keyboardMenu.setOptions( this.getPages().replacements );
                    }
                }
            ],
            attacks: [
                ...this.caster.actions.map(key => {
                    const action = Actions[key];
                    return {
                        label: action.name,
                        description: action.description || 'Sin descripcion',
                        handler: () => {
                            this.menuSubmit(action)
                        }
                    }
                }),
                backOption,
            ],
            items: [
                ...this.items.map(item => {
                    const action = Actions[item.actionId];
                    return {
                        label: action.name,
                        description: action.description || 'Sin descripcion',
                        right: () => {
                            return "x"+item.quantity;
                        },
                        handler: () => {
                            this.menuSubmit(action, item.instanceId)
                        }
                    }
                }),
                backOption
            ],
            replacements: [
                ...this.replacements.map(replacement => {
                    return {
                        label: replacement.name,
                        description: replacement.description,
                        handler: () => {
                            //LET ME IN!!!
                            this.menuSubmitReplacement(replacement)
                        }
                    }
                }),
                backOption
            ],
        }
    }

    menuSubmitReplacement(replacement) {
        this.keyboardMenu?.end();
        this.onComplete({
            replacement
        })
    }

    menuSubmit(action, instanceId=null) {

        this.keyboardMenu?.end();

        this.onComplete({
            action,
            target: action.targetType === "friendly" ? this.caster : this.enemy,
            instanceId
        })
    }

    decide() {
        //El enemigo decide randomly que hacer
        this.menuSubmit(Actions[ this.caster.actions[0] ]);
    }

    showMenu(container) {
        this.keyboardMenu = new KeyboardMenu();
        this.keyboardMenu.init(container); //Inject el elemento en el DOM
        this.keyboardMenu.setOptions( this.getPages().root );
    }

    init(container) {

        if (this.caster.isPlayerControlled) {
            //Muestra la UI
            this.showMenu(container)
        } else {
            this.decide()
        }    
    }
}