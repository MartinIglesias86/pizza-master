class PauseMenu {
    constructor({ progress, onComplete }) {
        this.progress = progress;
        this.onComplete = onComplete;
    }

    getOptions(pageKey){
        //Caso 1: Muestra la primera pagina de opciones
        if (pageKey === "root") {
            const lineupPizzas = playerState.lineup.map(id => {
                const {pizzaId} = playerState.pizzas[id];
                const base = Pizzas[pizzaId];
                return {
                    label: base.name,
                    description: base.description,
                    handler: () => {
                        this.keyboardMenu.setOptions( this.getOptions(id) )
                    }
                }
            })
            return [
                ...lineupPizzas,
                {
                    label: "Save",
                    description: "Guarda tu progreso",
                    handler: () => {
                        this.progress.save();
                        this.close();
                    }
                },
                {
                    label: "Close",
                    description:  "Cierra el menu",
                    handler: () => {
                        this.close();
                    }
                }
            ]
        }

        //Caso 2: muestra las opciones de solo una pizza (por id)
        const unequipped = Object.keys(playerState.pizzas).filter(id => {
            return playerState.lineup.indexOf(id) === -1;
        }).map(id => {
            const {pizzaId} = playerState.pizzas[id];
            const base = Pizzas[pizzaId];
            return {
                label: `Cambiar por ${base.name}`,
                description: base.description,
                handler: () => {
                    playerState.swapLineup(pageKey, id);
                    this.keyboardMenu.setOptions( this.getOptions("root") );
                }
            }
        })

        return[
            ...unequipped,
            {
                label: "Mover al frente",
                description: "Mueve esta pizza al principio de la lista",
                handler: () => {
                    playerState.moveToFront(pageKey);
                    this.keyboardMenu.setOptions( this.getOptions("root") );
                }
            },
            {
                label: "Volver",
                description: "Vuelve al menu principal",
                handler: () => {
                    this.keyboardMenu.setOptions( this.getOptions("root") )
                }
            }
        ];
    
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("PauseMenu");
        this.element.classList.add("overlayMenu");
        this.element.innerHTML = (`
            <h2>Pause Menu</h2>
        `)
    }

    close(){
        this.esc?.unbind();
        this.keyboardMenu.end();
        this.element.remove();
        this.onComplete();
    }

    async init(container) {
        this.createElement();
        this.keyboardMenu = new KeyboardMenu({
            descriptionContainer: container
        })
        this.keyboardMenu.init(this.element);
        this.keyboardMenu.setOptions(this.getOptions("root"));

        container.appendChild(this.element);

        //Espera para que no se cierre accidentalmente el menu
        utils.wait(200);
        //Keybinding para cerrar el menu
        this.esc = new KeyPressListener("Escape", () => {
            this.close();
        })

    }
}