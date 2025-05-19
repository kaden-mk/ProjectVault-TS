import { Players } from "@rbxts/services";

// Will defo clean this up later, but for now this is fine
export class NewPlayer {
    public player = Players.LocalPlayer;

    private state : { [key: string]: string | undefined } = {
        equippedWeapon: undefined
    }

    EquipWeapon(weaponName?: string) {
        this.state.equippedWeapon = weaponName; 
    }

    DoesPlayerHaveAWeaponEquipped() {
        return this.state.equippedWeapon;
    }
}