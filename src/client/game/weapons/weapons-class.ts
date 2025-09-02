// the main weapon class, handles and creates weapons

import { Workspace } from "@rbxts/services";
import { Object } from "shared/game/dependencies/object-util";

import { Spring } from "client/game/modules/spring";
import { Recoil } from "client/game/weapons/recoil/recoil-class";
import { RecoilProfile, RecoilProfileType } from "client/game/weapons/recoil/recoil-profile";

import { Message, messaging } from "shared/game/messaging";
import { PlayerController } from "../player/player-controller";
import { ViewmodelController } from "../player/viewmodel-controller";

import Signal from "@rbxts/lemon-signal";
import weapons from "shared/game/data/weapons";

export namespace WeaponUtil {
    export function DoesWeaponExist(weapon: keyof typeof weapons) {
        return weapons[weapon] !== undefined; 
    }
}

export class Weapon {
    public name;

    public readonly data;

    private model;
    private animations: { [key: string]: AnimationTrack } = {};
    private sounds: { [key: string]: Sound } = {};

    private state = {
        isEnabled: false,
        isEquipped: false,
        isAiming: false,
        isReloading: false,
        canFire: true,
    };

    private cooldown;

    public signals = {
        unEquipped: new Signal(),
    }

    public recoil;

    private aimPositionSpring = new Spring(250, 20);
    aimRotationSpring = new Spring(300, 20);
    private adsTransitionSpring = new Spring(300, 40);

    recoilProfileHip: RecoilProfileType;
    recoilProfileAds: RecoilProfileType;

    private rigMotors = new Map<string, { motor: Motor6D; baseC0: CFrame }>();

    constructor(readonly weaponName: keyof typeof weapons, protected playerController: PlayerController, protected viewmodelController: ViewmodelController) {        
        const canCreate = messaging.server.invoke(Message.createWeapon, Message.createWeaponReturn, { weaponName: weaponName }).await()[1];
        if (canCreate === false) throw `Weapon ${weaponName} does not exist!`;

        this.name = weaponName;
        this.data = weapons[weaponName];
        this.cooldown = 1 / (this.data.RPM / 60);
        this.model = this.data.Model.Clone();

        this.recoilProfileHip = RecoilProfile.create(this.data.Recoil.Hip);
        this.recoilProfileHip.RPM = this.data.RPM;

        this.recoilProfileAds = RecoilProfile.withOverrides(this.recoilProfileHip, this.data.Recoil.Ads);

        this.recoil = new Recoil(Workspace.CurrentCamera!, this.recoilProfileHip);

        this.InitializeRig();
        this.InitializeAnimations();
        this.InitializeSounds();
    }

    private InitializeAnimations() {
        for (const anim of this.model.FindFirstChild("Animations")!.FindFirstChild("VM")!.GetChildren()) {
            if (anim.IsA("Animation") === false) continue;

            this.animations[anim.Name] = this.viewmodelController.animator.LoadAnimation(anim as Animation);
        }
    }

    private InitializeSounds() {
        for (const sound of this.model.FindFirstChild("Sounds")!.GetChildren()) {
            if (sound.IsA("Sound") === false) continue;

            this.sounds[sound.Name] = sound;
        }
    }

    private InitializeRig() {
        const rig = this.data.Rig;

        for (const [key, data] of pairs(rig.VM)) {
            const part0 = Object.FindByPath(this.viewmodelController.model, data.Part0) as BasePart;
            const part1 = Object.FindByPath(this.model, data.Part1) as BasePart;

            if (part0 && part1) {
                const motor = Object.Rig(part0, part1, data.C0);

                this.rigMotors.set(part1.Name, {
                    motor: motor,
                    baseC0: data.C0,
                });
            }
        }
    }
    
    IsEquipped() {
        return this.state.isEquipped;
    }

    Equip() {
        if (this.state.isEquipped === true) return false;
        if (this.playerController.DoesPlayerHaveAWeaponEquipped()) return false;

        const canEquip = messaging.server.invoke(Message.equipWeapon, Message.equipWeaponReturn, { weaponName: this.name }).await()[1];
        if (!canEquip) return;

        this.playerController.EquipWeapon(this.name);
        this.state.isEquipped = true;

        this.model.Parent = this.viewmodelController.model;
        Object.SetPhysics(this.model, false, false);

        this.animations.Equip.Play();
        this.animations.Idle.Play();

        task.delay(this.data.EquipTime, () => {
            this.state.isEnabled = true;
        })

        return true;
    }   

    Aim(enable: boolean) {
        this.state.isAiming = enable;

        const profile = enable ? this.recoilProfileAds : this.recoilProfileHip;
        this.recoil.SwitchProfile(profile);
    }

    Unequip() {
        if (this.state.isEquipped === false) return;

        this.state.isEnabled = false;

        this.animations.Idle.Stop();
        this.animations.Unequip.Play();

        task.delay(this.data.UnequipTime, () => {
            this.state.isEquipped = false;
            this.playerController.EquipWeapon(undefined);
            this.model.Parent = undefined;

            this.signals.unEquipped.Fire();
        })
    }

    CanFire() {
        return this.state.canFire;
    }

    Fire() {
        if (this.state.isEnabled === false) return;
        if (this.state.isEquipped === false) return;
        if (this.state.canFire === false) return;

        const canFire = messaging.server.invoke(Message.fireWeapon, Message.fireWeaponReturn, { startCFrame: CFrame.identity }, true).await()[1];
        if (!canFire) return;

        this.state.canFire = false;
        task.delay(this.cooldown, () => {
            this.state.canFire = true;
        })

        this.animations.Fire.Play();
        this.recoil.Fire();
    }

    Reload() {
        if (this.state.isEnabled === false) return;
        if (this.state.isEquipped === false) return;
        if (this.state.isReloading === true) return; 

        if (this.state.isAiming) {
            this.animations.Reload.AdjustWeight(0.1);
        } else {
            this.animations.Reload.AdjustWeight(1);
        }

        this.animations.Reload.Play();
        this.sounds.Reload.Play();

        this.state.isReloading = true;

        task.delay(this.data.ReloadTime, () => {
            this.state.isReloading = false;
        });
    }

    Inspect() {
        if (this.state.isEnabled === false) return;
        if (this.state.isEquipped === false) return;

        this.animations.Inspect.Play();
    }

    private lastIsAiming = false;

    GetAimOffset(dt: number): CFrame {
        const aimPoint = this.model.FindFirstChild("AimPoint") as BasePart;
        if (!aimPoint) return CFrame.identity;

        const localOffset = aimPoint.CFrame.ToObjectSpace(this.viewmodelController.model.PrimaryPart!.CFrame);
        const positionOffset = localOffset.Position;
        const [x, y, z] = localOffset.ToOrientation();

        const targetPosition = this.state.isAiming ? positionOffset : Vector3.zero;
        const targetRotation = this.state.isAiming ? new Vector3(x, y, z) : Vector3.zero;

        this.aimPositionSpring.target = targetPosition;
        this.aimRotationSpring.target = targetRotation;

        const pos = this.aimPositionSpring.Update(dt);
        const rot = this.aimRotationSpring.Update(dt);

        let finalCFrame = new CFrame(pos).mul(CFrame.Angles(rot.X, rot.Y, rot.Z));

        if (this.state.isAiming !== this.lastIsAiming) {
            if (this.state.isAiming) {
                this.adsTransitionSpring.position = new Vector3(0, 0, 0);
            } else {
                this.adsTransitionSpring.position = new Vector3(1, 0, 0);
            }
            this.adsTransitionSpring.velocity = Vector3.zero;
            this.lastIsAiming = this.state.isAiming;
        }

        const targetAlpha = this.state.isAiming ? 1 : 0;
        this.adsTransitionSpring.target = new Vector3(targetAlpha, 0, 0);
        const alpha = this.adsTransitionSpring.Update(dt).X;

        const threshold = 0.06; 
        if (alpha > threshold && alpha < 1 - threshold) {
            if (this.state.isAiming) {
                finalCFrame = finalCFrame.mul(
                    this.data.ADSStartingTransition.Lerp(CFrame.identity, (alpha - threshold) / (1 - threshold))
                );
            } else {
                finalCFrame = finalCFrame.mul(
                    CFrame.identity.Lerp(this.data.ADSStopStartingTransition, (alpha - threshold) / (1 - threshold))
                );
            }
        }

        return finalCFrame;
    }

    GetOffset(dt: number): CFrame {
        const recoilOffset = this.recoil.Update(dt);
        const aimOffset = this.GetAimOffset(dt);

        return recoilOffset.mul(aimOffset);
    }
}