// the main weapon class, handles and creates weapons

import { OnRender, OnStart } from "@flamework/core";
import { ReplicatedStorage } from "@rbxts/services"
import { PlayerController } from "client/controllers/player-controller";
import { ViewmodelController } from "client/controllers/viewmodel-controller";
import weapons from "shared/data/weapons";
import { Object } from "shared/dependencies/object-util";

export class WeaponsClass implements OnStart, OnRender {
    public name;

    private data; // this data should NOT be changed at all.
    private model;

    private isEquipped = false;

    constructor(readonly weaponName: keyof typeof weapons, private playerController: PlayerController, private viewmodelController: ViewmodelController) {
        this.name = weaponName;
        this.data = weapons[weaponName];
        this.model = this.data.Model.Clone();
    }

    DoesWeaponExist(weapon: keyof typeof weapons) {
        return weapons[weapon] !== undefined; 
    }

    Equip() {
        if (this.isEquipped === true) return;
        if (this.playerController.DoesPlayerHaveAWeaponEquipped()) return;

        this.isEquipped = true;

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

        this.model.Parent = this.viewmodelController.model;
        Object.SetPhysics(this.model, false, false);
    }

    onStart() {}

    onRender(dt: number) {
        if (this.isEquipped === false) return;


    }
}