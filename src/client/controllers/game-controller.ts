// unfinished afffff, this is suppose to handle pretty much the ENTIRE game logic
// well on the client but that does include inputs for movement and other things

import { Controller, OnRender, OnStart } from "@flamework/core";
import { NewPlayer } from "client/classes/player-class";
import { Viewmodel } from "client/classes/viewmodel-class";
import { Weapon } from "client/classes/weapons-class";
import { Input } from "client/classes/input-class";
import { Message, messaging } from "shared/messaging";

/**
 *     RunEquipWeapon(weapon: Weapon, weapon2: Weapon) {
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
 */

@Controller()
export class GameController implements OnStart, OnRender {
    private weaponInputController: Input;
    private viewmodelController: Viewmodel;
    private playerController: NewPlayer;

    private playerWeapons: { [key: string]: Weapon } = {};
    private currentWeapon: Weapon | undefined = undefined;

    constructor() {
        this.playerController = new NewPlayer();
        this.viewmodelController = new Viewmodel(this.playerController);
        this.weaponInputController = new Input();
    }

    private EquipWeapon(weapon: Weapon) {
        const didEquip = weapon.Equip();

        if (didEquip) {
            this.currentWeapon = weapon;
        }
    }

    private RunEquipWeapon(weapon: Weapon, weapon2: Weapon) {
        if (weapon2?.IsEquipped()) {
            weapon2?.Unequip();
            weapon2?.signals.unEquipped.Wait();

            this.EquipWeapon(weapon);

            return;
        }

        this.EquipWeapon(weapon);
    }

    private InitializeInputs() {
        // to improve?
        this.weaponInputController.Bind("EquipWeapon", [Enum.KeyCode.One, Enum.KeyCode.Two], false, (input: InputObject) => {
            if (input.KeyCode === Enum.KeyCode.One) this.RunEquipWeapon(this.playerWeapons["C8A3"], this.playerWeapons["M1911"]);
            if (input.KeyCode === Enum.KeyCode.Two) this.RunEquipWeapon(this.playerWeapons["M1911"], this.playerWeapons["C8A3"]);
        });

        this.weaponInputController.Bind("Fire", Enum.UserInputType.MouseButton1, false, () => {
            this.currentWeapon?.Fire();
        });

        this.weaponInputController.Bind("Reload", Enum.KeyCode.R, false, () => {
            this.currentWeapon?.Reload();
        });

        this.weaponInputController.Bind("Inspect", Enum.KeyCode.B, false, () => {
            this.currentWeapon?.Inspect();
        });
    }

    onStart() {
        this.InitializeInputs();
        this.weaponInputController.Init();

        // Creating weapons, this is just a test/template so far.
        this.playerWeapons["C8A3"] = this.viewmodelController.CreateWeapon("C8A3") as Weapon;
        this.playerWeapons["M1911"] = this.viewmodelController.CreateWeapon("M1911") as Weapon;

        this.EquipWeapon(this.playerWeapons["C8A3"]);

        // test
        /*messaging.server.emit(Message.Test, {
            foo: "bar",
            n: 69,
        });*/
    }

    onRender() {
        this.viewmodelController.run();
    }
}