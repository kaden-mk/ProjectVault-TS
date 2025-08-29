import atoms from "shared/game/data/atoms";
import { Interactions } from "server/game/components/interactions";

export function GetClassFromPlayer(player: Player) {
    return playerClasses.get(player);
}

const playerClasses = new Map<Player, NewPlayer>();

export class NewPlayer {
    readonly player;

    public state = {
        equippedWeapon: undefined as string | undefined,
        activeInteraction: undefined as Interactions | undefined
    };

    public weaponState = {
        canDoAnything: true,
    }
    // set this to private soon?
    public inventory = {        
        weapons: {} as { [key: string]: boolean },
    }
    
    public atomState: typeof atoms;

    constructor(readonly playerItem: Player, playerState: typeof atoms) {
        this.atomState = playerState;
        this.player = playerItem;
        this.inventory.weapons = {
            C8A3: true,
            M1911: true
        };

        playerClasses.set(playerItem, this);
    }

    EquipWeapon(weapon: string) {
        if (this.state.equippedWeapon === weapon) return;

        this.state.equippedWeapon = weapon;
    }

    GetEquippedWeapon() {
        return this.state.equippedWeapon;
    }
}