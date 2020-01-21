// utils
// const wait = ms => new Promise((res)=>setTimeout(res, ms));
function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
        end = new Date().getTime();
    }
}

// the game

const stats = ['dexterity', 'endurance', 'intellect', 'might', 'wisdom'];
const armorAreas = ['head', 'body', 'arms', 'legs', 'feet'];
const armorTypes =['cloth', 'leather', 'scale', 'chain', 'plate'];
const damageTypes = ['slam', 'pierce', 'slash', 'shock', 'burn'];
const meleeWeaponTypes = ['club', 'dagger', 'sword', 'axe', 'shield'];
const rangeWeaponTypes = ['crossbow', 'longbow', 'wand', 'sling', 'throwing knife'];
const enemyTypes = ['varment', 'critter', 'creature', 'beast', 'monster'];
const desciption = ['tiny', 'formidable', 'wild', 'intimidating', 'ferocious'];
const spells = ['heal', 'rage', 'protection', 'focus', 'lightning'];

const classes = {
    'mage': {
        'className': 'mage',
        'exceptionalStat': 'wisdom',
        'rangeProficiency': 'wand'
    },
    'warrior': {
        'className': 'warrior',
        'exceptionalStat': 'might',
        'meleeProficiency': 'shield',
    },
    'cleric': {
        'className': 'cleric',
        'exceptionalStat': 'intellect',
        'meleeProficiency': 'club'
    },
    'ranger': {
        'className': 'ranger',
        'exceptionalStat': 'dexterity',
        'rangeProficiency': 'longbow'
    },
    'berserker': {
        'className': 'berserker',
        'exceptionalStat': 'endurance',
        'meleeProficiency': 'ax'
    }
};

const races = {
    'elf': {
        'raceName': 'elf',
        'statBonus': 'wisdom',
        'classInclination': 'mage',
        'bonusSpell': 'lightning',
        'meleeProficiency': 'dagger',
        'rangeProficiency': 'wand'
    },
    'dwarf': {
        'raceName': 'dwarf',
        'statBonus': 'might',
        'classInclination': 'warrior',
        'bonusSpell': 'protection',
        'meleeProficiency': 'shield',
        'rangeProficiency': 'crossbow'
    },
    'halfling': {
        'raceName': 'halfling',
        'statBonus': 'intellect',
        'classInclination': 'cleric',
        'bonusSpell': 'heal',
        'meleeProficiency': 'club',
        'rangeProficiency': 'sling'
    },
    'human': {
        'raceName': 'human',
        'statBonus': 'dexterity',
        'classInclination': 'ranger',
        'bonusSpell': 'focus',
        'meleeProficiency': 'sword',
        'rangeProficiency': 'longbow'
    },
    'orc': {
        'raceName': 'orc',
        'statBonus': 'endurance',
        'classInclination': 'berserker',
        'bonusSpell': 'rage',
        'meleeProficiency': 'ax',
        'rangeProficiency': 'throwing knife'
    }
};

class Dice {
    constructor(sides) {
        this.sides = sides;
    }

    roll(times=1) {
        let result = 0;
        for (let i=0; i<times; ++i) {
            result += Math.ceil(Math.random() * this.sides);
        }
        return result;
    }
}

const fourSidedDie = new Dice(4);
const sixSidedDie = new Dice(6);
const hundredDie = new Dice(100);

class Item {
    constructor(name, kwargs={}) {
        this.name=name;
        this.weight=kwargs.weight || 0;
        this.consumable=kwargs.consumable || false;
        this.maxDurability=kwargs.maxDurability || 1;
        this.durability=kwargs.durability || this.maxDurability;
        this.effect=kwargs.effect;
    }
}

class Weapon extends Item {
    constructor(name, damageDie=fourSidedDie, kwargs={}) {
        super(name, kwargs);
        this.die = damageDie;
        this.modifier = kwargs.modifier || 0;
        this.damageType = kwargs.damageType || damageTypes[0];
        this.isTwoHanded = kwargs.isTwoHanded || false;
        this.equipped = false;
    }

    get damage() {
        return this.die.roll() + this.modifier;
    }
}

class Armor extends Item {
    constructor(name, type, armorClass=0, kwargs={}) {
        super(name, kwargs);

        if (armorAreas.indexOf(type) != -1) {
            this.type = type;
        }
        this.armorClass = armorClass;
        // protectionFromTypes should be an object of a damageType and modifier
        this.protectionFromTypes = kwargs.protectionFromTypes || {};
        this.equipped = false;
    }
}

class LivingThing {
    constructor(race, kwargs={}) {
        stats.forEach(stat => this[stat] = this.rollForStat() );

        this.name = kwargs.name || "";
        this.race = race;
        this.experience = 0;
        this.level = kwargs.level || 1;
        this.armorClass = kwargs.armorClass || 0;
        this.hitpoints = this.maximumHitpoints;
        this.isNPC = kwargs.isNPC || true;
        this.inventory = kwargs.inventory || []; // max carrying capacity is equal to strength
    }

    get name() {
        return this._name || "level " + this.level + " " + this.race;
    }

    set name(name) {
        this._name = name;
    }

    get race() {
        return this._race.raceName;
    }

    set race(race) {
        if (typeof race === "object")
            this._race = race;
        else this._race = {raceName: race};
    }

    get class() {
        return this._class.className;
    }

    set class(characterClass) {
        this._class = characterClass;
    }

    get maximumHitpoints() {
        return this.endurance * this.level;
    }

    get meleeHitChance() {
        return this.dexterity * 5;
    }

    get meleeDamageModifier() {
        return Math.ceil((this.might + this.level) / (10 - this.level));
    }

    get critChance() {
        return this.intellect + this.level;
    }

    get dodgeChance() {
        return this.dexterity + this.level - this.armorClass;
    }

    rangeHitChance(targetModifier) {
        // targetModifier = target.dodgeChance * targetRange
        return (this.dexterity * this.level) - targetModifier;
    }

    rollForStat() {
        return sixSidedDie.roll(3);
    }

    canFlee() {
        return true;
    }

    get actions() {
        return ["attack", "block", "flee"];
    }

    takeTurn(turnActions=[]) {
        if (this.isNPC) return "attack";
        if (turnActions.length ===0) turnActions = this.actions;

        return promptUserActions(turnActions);
    }

    attack(target) {}
    block() {}
    use() {}
    cast() {}
    flee() {}
}

class PlayerCharacter extends LivingThing {
    constructor(race, kwargs={}) {
        super(race, kwargs);
        if (!this.race) this.race = races.human;
        this.isNPC = kwargs.isNPC || false;
        if (!this.isNPC) this.level = 1;

        this.applyRacialBonus();
    }

    applyRacialBonus() {
        const bonusStat = this.race.statBonus;
        if (this.hasOwnProperty(bonusStat)) this[bonusStat] += 2;
    }

    classAvailability() {
        // you can be any class with a stat 15 or above in inclination
        // or the highest stat
        // if 3 or more stats are 15 or above, you can be a 'hero' class
        const classInclination = {
            'endurance': 'berserker',
            'intellect': 'cleric',
            'wisdom': 'mage',
            'dexterity': 'ranger',
            'might': 'warrior'
        };
        const heroThreshold = 14;
        let availableClasses = [];
        let self = this;
        let heroPotential = 0;
        let bestStat = {};

        const setBestStats = function(stat) {
            let statValue = self[stat];
            if (statValue > heroThreshold) {
                availableClasses.push(classInclination[stat]);
                heroPotential++;
            } else if (bestStat.hasOwnProperty(statValue)) {
                bestStat[statValue].push(classInclination[stat]);
            } else {
                bestStat[statValue] = [classInclination[stat]];
            }
        };

        stats.forEach(stat => setBestStats(stat));
        if (heroPotential > 2) availableClasses.push('hero');

        if (availableClasses.length === 0) {
            let statKeys = Object.keys(bestStat);
            let topStat = Math.max(...statKeys);
            availableClasses = bestStat[topStat];
        }

        return availableClasses;
    }
}

const displayListChoices = function(arr) {
    let returnObject = {};
    let displayString = "";

    for (let i=0; i<arr.length; ++i) {
        let index = i + 1;
        returnObject[index] = arr[i];
        displayString += index + ": " + arr[i] + "\n";
    }

    return [displayString, returnObject];
};

const promptUserActions = function(actions=[]) {
    let [actionOptions, actionObject] = displayListChoices(actions);
    let actionSelection;
    let validSelection = false;

    while (!validSelection) {
        if (actionSelection === null) return;
        actionSelection = window.prompt("Select an action: \n" + actionOptions);
        if (actionSelection in actionObject) validSelection = true;
    }

    return actionObject[actionSelection];
};

const generatePlayerCharacter = function() {
    let [raceOptions, raceObject] = displayListChoices(Object.keys(races));
    let raceSelection, classSelection, playerName;
    let validSelection = false;

    while (!validSelection) {
        if (raceSelection === null) return;
        raceSelection = window.prompt("Select a race: \n" + raceOptions);
        if (raceSelection in raceObject) validSelection = true;
    }
    let playerRace = raceObject[raceSelection];
    let player = new PlayerCharacter(races[playerRace]);

    validSelection = false;
    let [classOptions, classObject] = displayListChoices(player.classAvailability());
    classOptions = "0: Start over\n" + classOptions;
    while (!validSelection) {
        if (classSelection === null) return;
        classSelection = window.prompt("Select from available classes: \n" + classOptions);
        if (classSelection === '0') break;
        if (classSelection in classObject) validSelection = true;
    }
    if (classSelection === '0') return generatePlayerCharacter();

    let playerClass = classObject[classSelection];
    player.class = classes[playerClass];

    playerName = window.prompt("What's your character's name?");
    if (playerName === null) return;

    player.name = playerName;
    return player;
};

const createKey = function(player) {
    const sep = ".|.";
    return [player.level, player.race, player.name].join(".|.");
};

const savePlayer = function(player) {
    let key = createKey(player);
    localStorage.setItem(key, JSON.stringify(player));
};

const loadPlayer = function() {
    let selectedCharacter, playerSelection;
    let savedCharacters = {};
    let validSelection = false;
    const storageKeys = Object.keys(localStorage);

    for (let i=0; i<storageKeys.length; ++i) {
        let playerCharacter = storageKeys[i];
        let [level, race, name] = playerCharacter.split(".|.");
        let readableKey = name + " (level " + level + " " + race + ")";

        savedCharacters[readableKey] = JSON.parse(localStorage.getItem(playerCharacter));
    }
    let [playerOptions, playerObject] = displayListChoices(Object.keys(savedCharacters));


    while (!validSelection) {
        if (playerSelection === null) return;
        playerSelection = window.prompt("Load Player: \n" + playerOptions);
        if (playerSelection in playerObject) validSelection = true;
    }
    selectedCharacter = playerObject[playerSelection];
    return savedCharacters[selectedCharacter];
};

const createOpponent = function() {
    const opponentAttributes = {
        isNPC: true,
    };
    let opponentRaceChoices = Object.keys(races);
    opponentRaceChoices.push('troll');
    const opponentRace = opponentRaceChoices[sixSidedDie.roll()];

    return Math.random() < 0.5 ? new LivingThing("rat", opponentAttributes) :
        new PlayerCharacter(opponentRace, opponentAttributes);
};

class Battle {
    constructor(combatants=[], kwargs={}) {
        this.round = 1;
        this.combatants = combatants;
        this.combatants.sort(function(a, b){
            return (b.intellect + b.dexterity) - (a.intellect + a.dexterity);
        });
        this.inititive = kwargs.inititive;
        this.nextRound();
    }

    calculateInitive() {
        let livingCombatants = this.combatants.filter(function(combatant) {
            return combatant.hitpoints > 0;
        });
        if (this.inititive) {
            livingCombatants = livingCombatants.filter(function(combatant) {
                return combatant !== this.inititve;
            });
            livingCombatants.unshift(this.initive);
            this.initive = undefined;
        }
        return livingCombatants;
    }
    // a round
    // 	the player with inititive goes first
    nextRound () {
        let livingCombatants = this.calculateInitive();
        if (livingCombatants.length < 2) return this.end();
        console.log("let round " + this.round + " begin!");

        for (let i=0; i<livingCombatants.length; ++i) {
            if (livingCombatants[i].hitpoints < 1) return this.end();

            let target = livingCombatants.filter(function(combatant) {
                return combatant !== livingCombatants[i];
            })[0];

            let action = livingCombatants[i].takeTurn();
            console.log(action);
            if (!action) return;
            wait(1000);

            console.log(livingCombatants[i].name + " " + action +"s " + target.name);

            attack(livingCombatants[i], target);
        }
        ++this.round;
        this.nextRound();
    }

    end() {
        console.log("the battle has ended");
        const winner = this.combatants.filter( function(combatant) {
            return combatant.hitpoints > 0;
        })[0];
        console.log("the winner is " + winner.name);
    }
}

const attack = function(attacker, defender) {
    let attackerRoll = hundredDie.roll() + attacker.meleeHitChance;
    let defenderRoll = hundredDie.roll() + defender.dodgeChance;

    if (defenderRoll > attackerRoll)  {
        console.log(attacker.name + " swings at " + defender.name + " and missed.");
        return;
    }

    const targetAreas = {
        1: 'head',
        2: 'body',
        3: 'body',
        4: 'arms',
        5: 'legs',
        6: 'feet'
    };

    let hitArea = targetAreas[sixSidedDie.roll()];

    let rollToCrit = hundredDie.roll();
    if (rollToCrit <= attacker.critChance) {
        console.log(hitArea + " critical hit! " + rollToCrit);
        return attacker.meleeDamageModifier;
    }

    let damage = attacker.meleeDamageModifier - defender.armorClass;
    console.log(attacker.name + " hit " + defender.name + " in the " + hitArea);
    console.log("...and does " + damage + " damage!");
    defender.hitpoints -= damage;
};


