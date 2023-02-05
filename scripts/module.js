

/**
 * A single Dungeon Actor
 * @typedef {Object} DungeonActor
 * @property {string} id - A unique ID to identify this actor.
 * @property {string} label - A label describing the Dungeon Actor's Action.
 * @property {number} frequency - A number denoting how many turns between actions.
 */
class DungeonActor {
    static ID = 'dungeon-turn-tracker'

    static FLAGS = {
        DUNGEONACTORS: 'dungeonactors'
    }

    static TEMPLATES = {
        DUNGEONTURNLIST: `modules/${this.ID}/templates/module.hbs`
    }

    static log(force, ...args){
        const shouldLog = force || Gamepad.modules.get('_dev-mode')?.api?.getPackageDebugValue(this.ID);

        if (shouldLog) {
            console.log(this.ID, '|', ...args);
        }
    }
}

class DungeonActorData {
    //All Dungeon actors for a user.
    static getDungeonActorsForUser(userId) {
        return game.users.get(userId)?.getFlag(DungeonActor.ID, DungeonActor.FLAGS.DUNGEONACTORS);
    }

    //All Dungeon Actors Registered
    static get allDungeonActors() {
        const allDungeonActors = game.users.reduce((accumulator, user) => {
            const userDungeonActors = this.getDungeonActorsForUser(user.id);

            return {
                ...accumulator,
                ...userDungeonActors
            }
        }, {});

        return allDungeonActors;
    }
    
    //Create a new Dungeon Actor
    static createDungeonActor(userId, dungeonActorData) {
        const newDungeonActor = {
            ...dungeonActorData,
            id: foundry.utils.randomID(16),
            userId,
        }

        const newDungeonActors = {
            [newDungeonActor.id]: newDungeonActor
        }

        return game.users.get(userId)?.setFlag(DungeonActor.ID, DungeonActor.FLAGS.DUNGEONACTORS, newDungeonActors);
    }

    //Update a specific dungeon actor by id with the provided updateData
    static updateDungeonActor(dungeonActorId, updateData) {
        const relevantDungeonActor = this.allDungeonActors[dungeonActorId];

        const update = {
            [dungeonActorId]: updateData
        }

        return game.users.get(relevantDungeonActor.userId)?.setFlag(DungeonActor.ID, DungeonActor.FLAGS.DUNGEONACTORS, update);
    }

    //Delete a specific Dungeon Actor by id
    static deleteDungeonActor(dungeonActorId) {
        const relevantDungeonActor = this.allDungeonActors[dungeonActorId];

        const keyDeletion = {
            [`-=${dungeonActorId}`]: null
        }

        return game.users.get(relevantDungeonActor.userId)?.setFlag(DungeonActor.ID, DungeonActor.FLAGS.DUNGEONACTORS, keyDeletion);
    }

    static updateUserDungeonActors(userId, updateData){
        return game.users.get(userId)?.setFlag(DungeonActor.ID, DungeonActor.FLAGS.DUNGEONACTORS, updateData);
    }
}

Hooks.once('init', async function() {

});

Hooks.once('ready', async function() {

});

Hooks.once('devModeReady', ({registerPackageDebugFlag}) => {
    registerPackageDebugFlag(DungeonActor.ID);
})

Hooks.on("renderCombatTracker", (app,html,data) => {

    const buttonLocation = html.find(".encounters.flexrow");

    const tooltip = game.i18n.localize('DUNGEON-TURN-TRACKER.open-tracker-button');

    buttonLocation.append(`<a class='combat-button combat-control' title='${tooltip}'><i class='fas fa-archway'></i></a>`);
});