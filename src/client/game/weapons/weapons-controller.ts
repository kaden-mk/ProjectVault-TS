import { Controller, OnRender, OnStart } from "@flamework/core"
import { TweenService, UserInputService, Workspace, } from "@rbxts/services"
import { UITil } from "client/game/modules/ui-til"
import { RecoilProfile, RecoilProfileType } from "client/game/weapons/recoil/recoil-profile"
import { Input } from "../input/input-class"
import { PlayerController } from "../player/player-controller"
import { ViewmodelController } from "../player/viewmodel-controller"
import { Weapon } from "./weapons-class"

import Iris from "@rbxts/iris"

function createCollapsingHeader(name: string, profile: RecoilProfileType) {
    Iris.CollapsingHeader([ name ]);

    for (const [key, value] of pairs(profile)) {
        if (key === "RPM" || key === "ShotIndex") continue;

        const state = Iris.State(value);
        Iris.InputNum([ key, 0.0001 ], { number: state });

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
   
    public weapons: { [key: string]: Weapon } = {};

    GetEquippedWeapon() {
        return this.currentWeapon;
    }

    private Run(ended: boolean) {
        if (!this.playerController.replicatedPlayerState.masked()) return;
        if (this.playerController.replicatedPlayerState.bagged() !== "undefined") return;

        if (!ended)
            this.Aim(true);

        this.playerController.state.running = !ended;
        
        const humanoid = this.playerController.player.Character?.FindFirstChildOfClass("Humanoid");
        if (!humanoid) return;

        humanoid.WalkSpeed = ended ? 16 : 24;
    }

    private Aim(ended: boolean) {
        if (this.playerController.state.running && ended === false)
            this.Run(true);

        const humanoid = this.playerController.player.Character?.FindFirstChildOfClass("Humanoid");

        if (humanoid) 
            humanoid.WalkSpeed = ended ? 16 : 10;

        this.currentWeapon?.Aim(!ended);
        UITil.Crosshair(ended);

        TweenService.Create(Workspace.CurrentCamera!, new TweenInfo(0.15, Enum.EasingStyle.Sine), {
            FieldOfView: ended ? 70 : 45
        }).Play();
    }

    private InitializeInputs() {
          // to improve?
        this.inputController.Bind("EquipWeapon", [Enum.KeyCode.One, Enum.KeyCode.Two], false, (input) => {
            this.isFiring = false;

            //if (input.KeyCode === Enum.KeyCode.One) this.RunEquipWeapon(this.playerWeapons["M4A1"], this.playerWeapons["M1911"]);
            //if (input.KeyCode === Enum.KeyCode.Two) this.RunEquipWeapon(this.playerWeapons["M1911"], this.playerWeapons["M4A1"]);
        });

        this.inputController.Bind("Fire", Enum.UserInputType.MouseButton1, true, (_, ended) => {
            if (!this.currentWeapon || this.currentWeapon.IsEquipped() === false) return;

            if (ended) {
                this.isFiring = false;
                RecoilProfile.reset(this.currentWeapon.recoilProfileAds);
                RecoilProfile.reset(this.currentWeapon.recoilProfileHip);
            }
            else {
                if (this.currentWeapon.data.Automatic === true) 
                    this.isFiring = true;
                
                this.currentWeapon.Fire();
            }
        });

        this.inputController.Bind("Aim", Enum.UserInputType.MouseButton2, true, (_, ended) => {
            if (!this.currentWeapon || this.currentWeapon.IsEquipped() === false) return;

            this.Aim(ended);
        })

        this.inputController.Bind("Reload", Enum.KeyCode.R, false, () => {
            if (!this.currentWeapon || this.currentWeapon.IsEquipped() === false) return;

            this.currentWeapon.Reload();
        });

        this.inputController.Bind("Inspect", Enum.KeyCode.B, false, () => {
            if (!this.currentWeapon || this.currentWeapon.IsEquipped() === false) return;

            this.currentWeapon.Inspect();
        });

        this.inputController.Bind("Debug", Enum.KeyCode.K, false, () => {
            if (!this.currentWeapon || this.currentWeapon.IsEquipped() === false) return;

            this.isDebugOpen.set(!this.isDebugOpen.get());
            UserInputService.MouseIconEnabled = this.isDebugOpen.get();
            this.playerController.player.CameraMode = Enum.CameraMode.Classic;
        });

        this.inputController.Bind("Run", Enum.KeyCode.LeftShift, true, (_, ended) => {
            this.Run(ended);
        });
    }

    onStart() {
        this.InitializeInputs();
        this.inputController.Init();

        this.weapons["M4A1"] = new Weapon("M4A1", this.playerController, this.viewmodelController) as Weapon;

        this.playerController.onMask.Connect(() => {
            task.delay(1, () => this.EquipWeapon(this.weapons["M4A1"]));
        });
        
        Iris.Init();
        Iris.Connect(() => {
            Iris.Window([ "Config" ], { isOpened: this.isDebugOpen });
                if (this.currentWeapon && this.currentWeapon.IsEquipped() === true) {
                    createCollapsingHeader("Hipfire", this.currentWeapon.recoilProfileHip);
                    createCollapsingHeader("ADS", this.currentWeapon.recoilProfileAds);
                }
            Iris.End();
        })    
    }

    // TODO: make this it's own module?
    private getBobbing(addition: number, speed: number, modifier: number) {
        return math.sin(tick() * addition * speed) * modifier;
    }

    getBobbingAndSwayOffsets(dt: number) {
        const isAiming = this.currentWeapon ? this.currentWeapon.IsAiming() : false;

        const delta = game.GetService("UserInputService").GetMouseDelta();
        const div = isAiming ? 75 : 50;

        this.viewmodelController.swaySpring.Shove(new Vector3(-delta.X / div, delta.Y / div, 0));

        const character = game.GetService("Players").LocalPlayer.Character;
        const humanoidRootPart = character?.PrimaryPart;
        if (!humanoidRootPart) return;

        // viewbobbing
        const modifier = isAiming ? 0.35 : 0.65;
        const bobAmount = new Vector3(
            this.getBobbing(5, 2, modifier),
            this.getBobbing(10, 2, modifier),
            0
        );
        this.viewmodelController.bobbingSpring.Shove(bobAmount.div(10).mul(humanoidRootPart.AssemblyLinearVelocity.Magnitude / 10));

        const swayOffset = this.viewmodelController.swaySpring.Update(dt);
        const swayCFrame = new CFrame(swayOffset.X, swayOffset.Y, 0).mul(CFrame.Angles(0, -swayOffset.X, swayOffset.Y));

        const bobOffset = this.viewmodelController.bobbingSpring.Update(dt);
        const bobCFrame = new CFrame(bobOffset.X, bobOffset.Y, bobOffset.Z);

        // running
        const targetPos = this.playerController.state.running ? new Vector3(-0.15, -0.2, 0.1) : new Vector3(0, 0, 0);
        const targetRot = this.playerController.state.running ? new Vector3(0, math.rad(20), math.rad(25)) : new Vector3(0, 0, 0);

        this.viewmodelController.runningSpring.Shove(targetPos.sub(this.viewmodelController.runningSpring.target));
        this.viewmodelController.runningSpring.target = targetPos;

        this.viewmodelController.runningSpringRot.Shove(targetRot.sub(this.viewmodelController.runningSpringRot.target));
        this.viewmodelController.runningSpringRot.target = targetRot;

        const runOffset = this.viewmodelController.runningSpring.Update(dt);
        const runRotOffset = this.viewmodelController.runningSpringRot.Update(dt);
        const runCFrame = new CFrame(runOffset.X, runOffset.Y, runOffset.Z).mul(CFrame.Angles(0, runRotOffset.Y, runRotOffset.Z));

        const rootCFrame = humanoidRootPart.CFrame;
        const velocity = humanoidRootPart.AssemblyLinearVelocity;
        const localVelocity = rootCFrame.VectorToObjectSpace(velocity);

        // movement
        this.viewmodelController.movementSpring.Shove(new Vector3(
            -localVelocity.X / (isAiming ? 100 : 50),
            0,
            -localVelocity.Z / (isAiming ? 50 : 20)
        ));

        const moveOffset = this.viewmodelController.movementSpring.Update(dt);
        const moveCFrame = new CFrame(moveOffset.X, moveOffset.Y, moveOffset.Z);

        // strafing
        const strafeTilt = -localVelocity.X / 200;

        this.viewmodelController.strafeSpring.target = new Vector3(0, 0, isAiming ? 0 : strafeTilt);

        const moveRotOffset = this.viewmodelController.strafeSpring.Update(dt);
        const moveRotCFrame = CFrame.Angles(0, 0, moveRotOffset.Z);

        return swayCFrame.mul(bobCFrame).mul(runCFrame).mul(moveCFrame).mul(moveRotCFrame);
    }

    onRender(dt: number) {
        const bobbingOffsets = this.getBobbingAndSwayOffsets(dt);

        if (!this.currentWeapon) {
            this.viewmodelController.setViewmodelCFrame(Workspace.CurrentCamera!.CFrame.mul(bobbingOffsets as CFrame));
            return;
        }

        const offset = this.currentWeapon.GetOffset(dt) as CFrame;

        this.viewmodelController.setViewmodelCFrame(Workspace.CurrentCamera!.CFrame.mul(offset).mul(bobbingOffsets as CFrame));
        this.viewmodelController.updateFakeCamera();

        if (this.isFiring && UserInputService.IsMouseButtonPressed(Enum.UserInputType.MouseButton1) && this.currentWeapon.CanFire() === true)
            this.currentWeapon.Fire();
    }
}