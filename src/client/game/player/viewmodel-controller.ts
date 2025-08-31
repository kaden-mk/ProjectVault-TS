import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { Weapon, WeaponUtil } from "../weapons/weapons-class";
import { Object } from "shared/game/dependencies/object-util";
import { Controller } from "@flamework/core"
import { PlayerController } from "./player-controller"

import weapons from "shared/game/data/weapons";

export type RunData = {
    offset: CFrame
}

@Controller()
export class ViewmodelController {
    model;
    animator;

    private camera = Workspace.CurrentCamera as Camera;
    private weapons: { [key: string]: Weapon } = {}

    constructor(private playerController: PlayerController) {
        this.model = ReplicatedStorage.Assets.Viewmodels.Default.Clone();
        this.animator = this.model.AnimationController.Animator;
        
        this.Init();
    }

    private Init() {
        this.model.Parent = this.camera;
        Object.SetPhysics(this.model, false, false);
    }

    CreateWeapon(weapon: keyof typeof weapons) {
        if (!WeaponUtil.DoesWeaponExist(weapon)) return;

        const newWeapon = new Weapon(weapon, this.playerController, this);

        if (!newWeapon) return;

        this.weapons[newWeapon.name] = newWeapon;

        return newWeapon;
    }

    setViewmodelCFrame(cframe: CFrame) {
        this.model.PivotTo(cframe);
    }
}