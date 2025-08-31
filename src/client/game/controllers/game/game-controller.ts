// unfinished afffff, this is suppose to handle pretty much the ENTIRE game logic
// well on the client but that does include inputs for movement and other things

import { Controller, OnRender, OnStart } from "@flamework/core";
import { TweenService, UserInputService, Workspace, StarterGui } from "@rbxts/services"
import { NewPlayer } from "client/game/classes/player-class";
import { Viewmodel } from "client/game/classes/viewmodel-class";
import { Weapon } from "client/game/classes/weapons-class";
import { Input } from "client/game/classes/input-class";
import { UITil } from "client/game/modules/ui-til"
import { RecoilProfileType } from "client/game/classes/recoil/recoil-profile"
import Iris  from "@rbxts/iris"

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

function createCollapsingHeader(name: string, profile: RecoilProfileType) {
    Iris.CollapsingHeader([ name ]);

    for (const [key, value] of pairs(profile)) {
        if (key === "RPM" || key === "ShotIndex") continue;

        const state = Iris.State(value);
        Iris.InputNum([ key, 0.01 ], { number: state });

        profile[key] = state.get();
    }
    
    Iris.End();
}

@Controller()
export class GameController implements OnStart, OnRender {
    private weaponInputController: Input;
    private viewmodelController: Viewmodel;
    private playerController: NewPlayer;

    private playerWeapons: { [key: string]: Weapon } = {};
    private currentWeapon: Weapon | undefined = undefined;

    private isDebugOpen = Iris.State(false);

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

    private isFiring = false;

    private InitializeInputs() {
        // to improve?
        this.weaponInputController.Bind("EquipWeapon", [Enum.KeyCode.One, Enum.KeyCode.Two], false, (input: InputObject) => {
            this.isFiring = false;

            //if (input.KeyCode === Enum.KeyCode.One) this.RunEquipWeapon(this.playerWeapons["M4A1"], this.playerWeapons["M1911"]);
            //if (input.KeyCode === Enum.KeyCode.Two) this.RunEquipWeapon(this.playerWeapons["M1911"], this.playerWeapons["M4A1"]);
        });

        this.weaponInputController.Bind("Fire", Enum.UserInputType.MouseButton1, true, (input, ended) => {
            if (ended)
                this.isFiring = false;
            else {
                if (this.currentWeapon?.data.Automatic === true) 
                    this.isFiring = true;
                
                this.currentWeapon?.Fire();
            }
        });

        this.weaponInputController.Bind("Aim", Enum.UserInputType.MouseButton2, true, (input, ended) => {
            this.currentWeapon?.Aim(!ended);
            UITil.Crosshair(ended);

            TweenService.Create(Workspace.CurrentCamera!, new TweenInfo(0.15, Enum.EasingStyle.Sine), {
                FieldOfView: ended ? 70 : 45
            }).Play();
        })

        this.weaponInputController.Bind("Reload", Enum.KeyCode.R, false, () => {
            this.currentWeapon?.Reload();
        });

        this.weaponInputController.Bind("Inspect", Enum.KeyCode.B, false, () => {
            this.currentWeapon?.Inspect();
        });

        this.weaponInputController.Bind("Debug", Enum.KeyCode.K, false, () => {
            this.isDebugOpen.set(!this.isDebugOpen.get());
            UserInputService.MouseIconEnabled = this.isDebugOpen.get();
            this.playerController.player.CameraMode = Enum.CameraMode.Classic;
        });
    }

    onStart() {
        StarterGui.SetCoreGuiEnabled("Backpack", false);

        UserInputService.MouseIconEnabled = false;

        this.InitializeInputs();
        this.weaponInputController.Init();

        // Creating weapons, this is just a test/template so far.
        this.playerWeapons["M4A1"] = this.viewmodelController.CreateWeapon("M4A1") as Weapon;

        this.EquipWeapon(this.playerWeapons["M4A1"]);
        
        Iris.Init();
        Iris.Connect(() => {
            Iris.Window([ "Config" ], { isOpened: this.isDebugOpen });
                createCollapsingHeader("Hipfire", this.currentWeapon!.recoilProfileHip);
                createCollapsingHeader("ADS", this.currentWeapon!.recoilProfileAds);
            Iris.End();
        })
    }

    onRender(dt: number) {
        const offset = this.currentWeapon?.GetOffset(dt) as CFrame;

        this.viewmodelController.setViewmodelCFrame(Workspace.CurrentCamera!.CFrame.mul(offset));

        if (this.isFiring && UserInputService.IsMouseButtonPressed(Enum.UserInputType.MouseButton1))
            this.currentWeapon?.Fire();
    }
}