// The main viewmodel controller, handles the viewmodel
// The reason why this isn't a class is because this will only ever be created 1 time.

import { Controller, OnRender, OnStart } from "@flamework/core"
import { ReplicatedStorage, Workspace } from "@rbxts/services"
import { Object } from "shared/dependencies/object-util";
import { WeaponsClass } from "client/classes/weapons-class";
import weapons from "shared/data/weapons";
import { PlayerController } from "./player-controller";

@Controller()
export class ViewmodelController implements OnRender, OnStart {
    public model;

    private camera = Workspace.CurrentCamera as Camera;
    
    private weapons: { [key: string]: WeaponsClass } = {}

    constructor(private playerController: PlayerController) {
        // since there isn't any server sided networking to set-up the proper viewmodel, we'll use the default one.
        
        this.model = ReplicatedStorage.Assets.Viewmodels.Default.Clone();
    }

    CreateWeapon(weapon: keyof typeof weapons) {
        const newWeapon = new WeaponsClass(weapon, this.playerController, this);

        if (!newWeapon) return;

        this.weapons[newWeapon.name] = newWeapon;

        return newWeapon;
    }

    onStart() {
        this.model.Parent = this.camera;

        Object.SetPhysics(this.model, false, false);
    }

    onRender(dt: number) {
        // a basic test of setting the model to our camera's cframe.

        this.model.PivotTo(this.camera.CFrame);
    }
}