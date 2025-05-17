import { Players } from "@rbxts/services";
import weapons from "shared/data/weapons";

export class PlayerClass {
    readonly player;

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

    constructor(readonly playerItem: Player) {
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