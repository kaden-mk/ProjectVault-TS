import { Weapon } from "./weapons-class"
import { ViewmodelController } from "../player/viewmodel-controller"
import { PlayerController } from "../player/player-controller"
import { Controller, OnStart, OnRender } from "@flamework/core"
import { Input } from "../input/input-class"
import { UITil } from "client/game/modules/ui-til"
import { TweenService, Workspace, UserInputService, } from "@rbxts/services"
import { RecoilProfileType } from "client/game/weapons/recoil/recoil-profile"

import Iris from "@rbxts/iris"

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
export class WeaponController implements OnStart, OnRender {
    private inputController = new Input();

    constructor(private playerController: PlayerController, private viewmodelController: ViewmodelController) {}

    // TODO: Make it automatically get weapon2 using playerController
    private RunEquipWeapon(weapon: Weapon, weapon2: Weapon) {  
        if (weapon2?.IsEquipped()) {
            weapon2?.Unequip();
            weapon2?.signals.unEquipped.Wait();

            this.EquipWeapon(weapon);

            return;
        }

        this.EquipWeapon(weapon);
    }

    private EquipWeapon(weapon: Weapon) {
        const didEquip = weapon.Equip();

        if (didEquip)
            this.currentWeapon = weapon;
    }

    private isFiring = false;
    private isDebugOpen = Iris.State(false);
    private currentWeapon: Weapon | undefined = undefined; // maybe make player controller's current weapon also be the weapon itself?

    private InitializeInputs() {
          // to improve?
        this.inputController.Bind("EquipWeapon", [Enum.KeyCode.One, Enum.KeyCode.Two], false, (input) => {
            this.isFiring = false;

            //if (input.KeyCode === Enum.KeyCode.One) this.RunEquipWeapon(this.playerWeapons["M4A1"], this.playerWeapons["M1911"]);
            //if (input.KeyCode === Enum.KeyCode.Two) this.RunEquipWeapon(this.playerWeapons["M1911"], this.playerWeapons["M4A1"]);
        });

        this.inputController.Bind("Fire", Enum.UserInputType.MouseButton1, true, (input, ended) => {
            if (ended)
                this.isFiring = false;
            else {
                if (this.currentWeapon?.data.Automatic === true) 
                    this.isFiring = true;
                
                this.currentWeapon?.Fire();
            }
        });

        this.inputController.Bind("Aim", Enum.UserInputType.MouseButton2, true, (input, ended) => {
            this.currentWeapon?.Aim(!ended);
            UITil.Crosshair(ended);

            TweenService.Create(Workspace.CurrentCamera!, new TweenInfo(0.15, Enum.EasingStyle.Sine), {
                FieldOfView: ended ? 70 : 45
            }).Play();
        })

        this.inputController.Bind("Reload", Enum.KeyCode.R, false, () => {
            this.currentWeapon?.Reload();
        });

        this.inputController.Bind("Inspect", Enum.KeyCode.B, false, () => {
            this.currentWeapon?.Inspect();
        });

        this.inputController.Bind("Debug", Enum.KeyCode.K, false, () => {
            this.isDebugOpen.set(!this.isDebugOpen.get());
            UserInputService.MouseIconEnabled = this.isDebugOpen.get();
            this.playerController.player.CameraMode = Enum.CameraMode.Classic;
        });
    }

    onStart() {
        UserInputService.MouseIconEnabled = false;

        this.InitializeInputs();
        this.inputController.Init();

        // Creating weapons, this is just a test/template so far.
        this.playerController.weapons["M4A1"] = new Weapon("M4A1", this.playerController, this.viewmodelController) as Weapon;
        this.EquipWeapon(this.playerController.weapons["M4A1"]);
        
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