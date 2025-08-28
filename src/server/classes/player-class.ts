import atoms from "shared/data/atoms";

export class NewPlayer {
    readonly player;

    public atomState;

    private state = {
        equippedWeapon: undefined as string | undefined,
    };

    public weaponState = {
        canDoAnything: true,
    }
    // set this to private soon?
    public inventory = {        
        weapons: {} as { [key: string]: boolean },
    }

    constructor(readonly playerItem: Player, playerState: typeof atoms) {
        this.atomState = playerState;
        this.player = playerItem;
        this.inventory.weapons = {
            C8A3: true,
            M1911: true
        };
    }

    EquipWeapon(weapon: string) {
        if (this.state.equippedWeapon === weapon) return;

        this.state.equippedWeapon = weapon;
    }

    GetEquippedWeapon() {
        return this.state.equippedWeapon;
    }
}