class TurnCycle {
    constructor({ battle, onNewEvent, onWinner }) {
        this.battle = battle;
        this.onNewEvent = onNewEvent;
        this.onWinner = onWinner;
        this.currentTeam = "player"; //o "enemy"
    }

    async turn() {
        //Obtener el caster (pre events)
        const casterId = this.battle.activeCombatants[this.currentTeam];
        const caster = this.battle.combatants[casterId];
        const enemyId = this.battle.activeCombatants[caster.team === "player" ? "enemy" : "player"];
        const enemy = this.battle.combatants[enemyId];

        const submission = await this.onNewEvent({
            type: "submissionMenu",
            caster,
            enemy
        })

        //Detener aca si estamos reemplazando esta pizza
        if (submission.replacement) {
            await this.onNewEvent({
                type: "replace",
                replacement: submission.replacement
            })
            await this.onNewEvent({
                type: "textMessage",
                text: `Tu turno ${submission.replacement.name}!`
            })
            this.nextTurn();
            return;
        }

        if (submission.instanceId) {
            
            //Agrega item a la lista para que persista en el player state despues
            this.battle.usedInstanceIds[submission.instanceId] = true;

            //Remueve el item del battle state
            this.battle.items = this.battle.items.filter(i => i.instanceId !== submission.instanceId)
        }

        const resultingEvents = caster.getReplacedEvents(submission.action.success);
        
        for(let i = 0; i<resultingEvents.length; i++) {
            const event = {
                ...resultingEvents[i],
                submission,
                action: submission.action,
                caster,
                target: submission.target,
            }
            await this.onNewEvent(event);
        }

        //Chequea si el target murio
        const targetDead = submission.target.hp <= 0;
            if (targetDead) {
                await this.onNewEvent({ 
                type: "textMessage", text: `${submission.target.name} quedo arruinada!`
                })

                //Dar experiencia por matar otra pizza
                if(submission.target.team === "enemy"){

                    const playerActivePizzaId = this.battle.activeCombatants.player;
                    const xp = submission.target.givesXp;
                    await this.onNewEvent({
                        type: "textMessage",
                        text: `Ganaste ${xp} puntos de experiencia!`
                    })
                    await this.onNewEvent({
                        type: "giveXp",
                        xp,
                        combatant: this.battle.combatants[playerActivePizzaId],
                    })
                }
            }   
        //Chequea si hay un equipo ganador
        const winner = this.getWinningTeam();
        if (winner) {
            await this.onNewEvent({
            type: "textMessage",
            text: "Ganador!"
            })
            this.onWinner(winner);
            return;
        }

        //Tenemos un objetivo muerto, pero no equipo ganador, metemos un reemplazo a la pelea
        if (targetDead) {
            const replacement = await this.onNewEvent({
                type: "replacementMenu",
                team: submission.target.team
            })
            await this.onNewEvent({
                type: "replace",
                replacement: replacement
            })
            await this.onNewEvent({
                type: "textMessage",
                text: `${replacement.name} esta lista!`
            })
        }
        //Busca eventos posteriores (post events)
        //(Hacer cosas DESPUES del envio de tu turno original)
        const postEvents = caster.getPostEvents();
        for (let i=0; i < postEvents.length; i++) {
            const event = {
                ...postEvents[i],
                submission,
                action: submission.action,
                caster,
                target: submission.target,
            }
            await this.onNewEvent(event);
        }

        //Busca si el status expiro
        const expiredEvent = caster.decrementStatus();
        if (expiredEvent) {
            await this.onNewEvent(expiredEvent)
        }

        this.nextTurn();
        }

        nextTurn() {
            this.currentTeam = this.currentTeam === "player" ? "enemy" : "player";
            this.turn();
        }

        getWinningTeam() {
            let aliveTeams = {};
            Object.values(this.battle.combatants).forEach(c => {
                if (c.hp > 0) {
                aliveTeams[c.team] = true;
                }
            })
            if (!aliveTeams["player"]) { return "enemy"}
            if (!aliveTeams["enemy"]) { return "player"}
            return null;
        }
        
        async init() {
            await this.onNewEvent({
                type: "textMessage",
                text: `${this.battle.enemy.name} te esta desafiando!`
            })
        
            //Start the first turn!
            this.turn();
        
        }
        
}