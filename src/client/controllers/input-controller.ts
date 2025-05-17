import { Controller, OnRender, OnStart } from "@flamework/core";
import { ViewmodelController } from "./viewmodel-controller";
import { Input } from "shared/dependencies/input-util";
import { PlayerController } from "./player-controller";
import { WeaponsClass } from "client/classes/weapons-class";

@Controller()
export class InputController implements OnStart, OnRender {
    constructor(private viewmodelController: ViewmodelController, private playerController: PlayerController) {}

    private currentWeapon: WeaponsClass | undefined = undefined;

    RunEquipWeapon(weapon: WeaponsClass, weapon2: WeaponsClass) {
        if (weapon2?.IsEquipped()) {
            weapon2?.Unequip();
            weapon2?.signals.unEquipped.Wait();
            weapon.Equip();
            this.currentWeapon = weapon;

            return;
        }

        weapon.Equip();
        this.currentWeapon = weapon;
    }

    onStart() {
        // Creating weapons
        const weapon1 = this.viewmodelController.CreateWeapon("C8A3") as WeaponsClass;
        const weapon2 = this.viewmodelController.CreateWeapon("M1911") as WeaponsClass;

        Input.Bind("EquipWeapon1", Enum.KeyCode.One, false, () => {
            this.RunEquipWeapon(weapon1, weapon2);
        })

        Input.Bind("EquipWeapon2", Enum.KeyCode.Two, false, () => {
            this.RunEquipWeapon(weapon2, weapon1);
        })

        Input.Bind("Fire", Enum.UserInputType.MouseButton1, false, () => {
            this.currentWeapon?.Fire();
        });

        Input.Bind("Inspect", Enum.KeyCode.B, false, () => {
            this.currentWeapon?.Inspect();  
        });

        Input.Bind("Reload", Enum.KeyCode.R, false, () => {
            this.currentWeapon?.Reload();
        })
    }

    onRender(dt: number) {
        
    }
}