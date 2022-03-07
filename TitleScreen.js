class TitleScreen {
    constructor({ progress }) {
        this.progress = progress;
    }

    getOptions(resolve) {
        const safeFile = this.progress.getSaveFile();
        return [
            {
                label: "Nueva partida",
                description: "Comienza una nueva aventura",
                handler:  () => {
                    this.close();
                    resolve();
                }
            },
            //Opcion de continuar
            safeFile ? {
                label: "Continuar partida",
                description: "Continua con la ultima aventura guardada",
                handler: () => {
                    this.close();
                    resolve(safeFile);
                }
            } : null
        ].filter(v => v); //Filtra los valores no son Truthy
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("TitleScreen");
        this.element.innerHTML = (`
            <img class="TitleScreen_logo" src="/images/logo.png" alt="Pizza Master" />
        `)
    }

    close() {
        this.keyboardMenu.end();
        this.element.remove();
    }

    init(container) {
        return new Promise(resolve => {
            this.createElement();
            container.appendChild(this.element);
            this.keyboardMenu = new KeyboardMenu();
            this.keyboardMenu.init(this.element);
            this.keyboardMenu.setOptions(this.getOptions(resolve));
        })
    }

}
