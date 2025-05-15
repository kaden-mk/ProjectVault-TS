import { Controller, OnRender, OnStart } from "@flamework/core";
import { ViewmodelController } from "./viewmodel-controller";
import { Input } from "shared/dependencies/input-util";
import { PlayerController } from "./player-controller";

@Controller()
export class InputController implements OnStart, OnRender {
    constructor(private viewmodelController: ViewmodelController, private playerController: PlayerController) {}

    onStart() {
        // Creating weapons
        const weapon1 = this.viewmodelController.CreateWeapon("C8A3");
        const weapon2 = this.viewmodelController.CreateWeapon("M1911");

        Input.Bind("EquipWeapon1", Enum.KeyCode.One, false, () => {
            weapon1?.Equip();
        })
    }

    onRender(dt: number) {
        
    }
}