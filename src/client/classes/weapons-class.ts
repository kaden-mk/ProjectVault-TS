// the main weapon class, handles and creates weapons

import { ReplicatedStorage } from "@rbxts/services"
import { PlayerController } from "client/controllers/player-controller";
import { ViewmodelController } from "client/controllers/viewmodel-controller";
import weapons from "shared/data/weapons";
import { Object } from "shared/dependencies/object-util";

export namespace Weapons {
    export function DoesWeaponExist(weapon: keyof typeof weapons) {
        return weapons[weapon] !== undefined; 
    }
}

export class WeaponsClass {
    public name;

    private data; // this data should NOT be changed at all.
    private model;
    private animations: { [key: string]: AnimationTrack } = {};

    private isEquipped = false;

    constructor(readonly weaponName: keyof typeof weapons, private playerController: PlayerController, private viewmodelController: ViewmodelController) {
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

    Equip() {
        if (this.isEquipped === true) return;
        if (this.playerController.DoesPlayerHaveAWeaponEquipped()) return;

        this.isEquipped = true;

        this.model.Parent = this.viewmodelController.model;
        Object.SetPhysics(this.model, false, false);

        this.animations.Equip.Play();
        this.animations.Idle.Play();
    }
}