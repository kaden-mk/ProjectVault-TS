import { Controller, OnRender, OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";

@Controller()
export class PlayerController implements OnRender, OnStart {
    public player = Players.LocalPlayer;

    private state : { [key: string]: string | undefined } = {
        equippedWeapon: undefined
    }

    EquipWeapon(weaponName: string) {
        this.state.equippedWeapon = weaponName; 
    }

    DoesPlayerHaveAWeaponEquipped() {
        return this.state.equippedWeapon;
    }

    onStart() {
        
    }

    onRender(dt: number) {
        
    }
}