class BattleEvent {
    constructor(event, battle) {
        this.event = event;
        this.battle = battle;
    }

    textMessage(resolve) {

        const text = this.event.text
        .replace("{CASTER}", this.event.caster?.name)
        .replace("{TARGET}", this.event.target?.name)
        .replace("{ACTION}", this.event.action?.name)

        const message = new TextMessage({
            text,
            onComplete: () => {
                resolve();
            }
        })
        message.init( this.battle.element )
    }

    async stateChange(resolve) {
        const {caster, target, damage, recover, status, action} = this.event;
        let who = this.event.onCaster ? caster : target;
        
        if (damage) {
            //Modifica el target para que tenga menos HP
            target.update({
                hp: target.hp - damage
            })
            //empieza el blinking
            target.pizzaElement.classList.add("battle-damage-blink");
        }
        
        if (recover) {
            let newHp = who.hp + recover;
            if (newHp > who.maxHp) {
                newHp = who.maxHp;
            }
            who.update ({
                hp: newHp
            })
        }

        if (status) {
            who.update({
                status: {...status}
            })
        }
        if (status === null) {
            who.update({
                status: null
            })
        }

        //espera un momento
        await utils.wait(600)
        
        //Actualiza componentes de los teams
        this.battle.playerTeam.update();
        this.battle.enemyTeam.update();

        //detiene el blinking
        target.pizzaElement.classList.remove("battle-damage-blink");
        resolve();
    }

    submissionMenu(resolve) {
        const {caster} = this.event;
        const menu = new SubmissionMenu({
            caster: caster,
            enemy: this.event.enemy,
            items: this.battle.items,
            replacements: Object.values(this.battle.combatants).filter(c => {
                return c.id !== caster.id && c.team === caster.team && c.hp > 0
            }),
            onComplete: submission => {
                //Envia que usar, contra quien usarlo
                resolve(submission)
            }

        })
        menu.init( this.battle.element )
    }

    replacementMenu(resolve) {
        const menu = new ReplacementMenu({
            replacements: Object.values(this.battle.combatants).filter(c => {
            return c.team === this.event.team && c.hp > 0
            }),
            onComplete: replacement => {
            resolve(replacement)
            }
        })
        menu.init( this.battle.element )
    }

    //Cambia la pizza activa
    async replace(resolve) {
        const {replacement} = this.event;

        //Clear el anterior combatant
        const prevCombatant = this.battle.combatants[this.battle.activeCombatants[replacement.team]];
        this.battle.activeCombatants[replacement.team] = null;
        prevCombatant.update();
        await utils.wait(400);

        //Ingresa el nuevo combatant
        this.battle.activeCombatants[replacement.team] = replacement.id;
        replacement.update();
        await utils.wait(400);

        //Actualiza componentes de los teams
        this.battle.playerTeam.update();
        this.battle.enemyTeam.update();

        resolve();
    }

    animation(resolve) {
        const fn = BattleAnimations[this.event.animation];
        fn(this.event, resolve);
    }

    init(resolve) {
        this[this.event.type](resolve);
    }
}