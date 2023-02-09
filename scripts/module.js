class DungeonTurnConfig extends FormApplication {
    static get defaultOptions() {
        const defaults = super.defaultOptions;

        const overrides = {
            height: 'auto',
            id: 'dungeon-turn-tracker',
            template: DungeonActor.TEMPLATES.DUNGEONTURNLIST,
            title: 'Dungeon Turn Tracker',
            userId: game.userId,
        };

        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);

        return mergedOptions;
    }

    getData(options) {
        return {
            dungeonTurns: DungeonActorData.getDungeonActorsForUser(options.userId)
        }
    }
}

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
        DUNGEONTURNLIST: `modules/${this.ID}/templates/dungeon_turn_tracker.hbs`
    }

    static log(force, ...args){
        const shouldLog = force || Gamepad.modules.get('_dev-mode')?.api?.getPackageDebugValue(this.ID);

        if (shouldLog) {
            console.log(this.ID, '|', ...args);
        }
    }

    static initialize(){
        this.dungeonActorConfig = new DungeonTurnConfig();
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

    //Update dungeon actors for a user.
    static updateUserDungeonActors(userId, updateData){
        return game.users.get(userId)?.setFlag(DungeonActor.ID, DungeonActor.FLAGS.DUNGEONACTORS, updateData);
    }
}

Hooks.once('init', async function() {
    DungeonActor.initialize();
});

Hooks.once('ready', async function() {

});

Hooks.once('devModeReady', ({registerPackageDebugFlag}) => {
    registerPackageDebugFlag(DungeonActor.ID);
});

Hooks.on("renderCombatTracker", (app,html,data) => {

    //Locate the area we want to have the encounter tracker button (at the top of the combat tracker tab.)
    //no space between the css classes to show that we want both, it sounds like having a space between them is an "OR" instead of and.
    const buttonLocation = html.find(".encounters.flexrow");

    //Make it so that the hovered tooltip is localized to the correct language.
    const tooltip = game.i18n.localize('DUNGEON-TURN-TRACKER.open-tracker-button');

    //Make the button, I just copied the format of the other combat tracker control buttons, keeping the same css classes let them have the same formatting! "NEAT!"
    buttonLocation.append(`<a class='combat-button combat-control dungeon-tracker-icon-button' title='${tooltip}'><i class='fas fa-archway'></i></a>`);

    //Create a listener for when the button is clicked, it doesnt do anything yet, but it will soon.
    html.on('click', '.dungeon-tracker-icon-button', (event) => {
        DungeonActor.dungeonActorConfig.render(true);
    })
});