// the main weapon class, handles and creates weapons

import { ReplicatedStorage } from "@rbxts/services"
import weapons from "shared/data/weapons";
import { Object } from "shared/dependencies/object-util";

import Signal from "@rbxts/lemon-signal";
import { Events, Functions } from "client/network";
import { Viewmodel } from "./viewmodel-class";
import { NewPlayer } from "./player-class";

export namespace WeaponUtil {
    export function DoesWeaponExist(weapon: keyof typeof weapons) {
        return weapons[weapon] !== undefined; 
    }
}

export class Weapon {
    public name;

    private data; // this data should NOT be changed at all.
    private model;
    private animations: { [key: string]: AnimationTrack } = {};

    private state = {
        isEnabled: false,
        isEquipped: false
    };

    public signals = {
        unEquipped: new Signal(),
    }

    constructor(readonly weaponName: keyof typeof weapons, private playerController: NewPlayer, private viewmodelController: Viewmodel) {
        if (!Functions.createWeapon.invoke(weaponName)) throw `Weapon ${weaponName} does not exist!`;
        
        this.name = weaponName;
        this.data = weapons[weaponName];
        this.model = this.data.Model.Clone();

        this.InitializeRig();
        this.InitializeAnimations();
    }

    InitializeAnimations() {
        for (const anim of this.model.FindFirstChild("Animations")!.FindFirstChild("VM")!.GetChildren()) {
            if (anim.IsA("Animation") === false) continue;

            this.animations[anim.Name] = this.viewmodelController.animator.LoadAnimation(anim as Animation);
        }
    }

    InitializeRig() {
        const handleRig = this.data.HandleRig.VM;
        const to = handleRig.To;
        const tagged = handleRig.Tagged;
        const pos = handleRig.Position;
        const rot = handleRig.Rotation;

        let rigPart: BasePart | undefined = undefined;

        if (tagged)
            rigPart = Object.FindPartFromTag(this.viewmodelController.model, to) as BasePart;
        else
            rigPart = this.viewmodelController.model.FindFirstChild(to, true) as BasePart;

        const CF = CFrame.fromEulerAnglesYXZ(
            math.rad(rot.X),
            math.rad(rot.Y),
            math.rad(rot.Z)
        ).add(pos);

        const motor = Object.Rig(rigPart, this.model.PrimaryPart!, CF)
        motor.Parent = this.model.PrimaryPart;
    }
    
    IsEquipped() {
        return this.state.isEquipped;
    }

    Equip() {
        if (this.state.isEquipped === true) return false;
        if (this.playerController.DoesPlayerHaveAWeaponEquipped()) return false;

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

    Fire() {
        if (this.state.isEnabled === false) return;
        if (this.state.isEquipped === false) return;

        this.animations.Fire.Play();
    }

    Reload() {
        if (this.state.isEnabled === false) return;
        if (this.state.isEquipped === false) return;

        this.animations.Reload.Play();
    }

    Inspect() {
        if (this.state.isEnabled === false) return;
        if (this.state.isEquipped === false) return;

        this.animations.Inspect.Play();
    }
}