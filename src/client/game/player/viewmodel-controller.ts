import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { Object } from "shared/game/dependencies/object-util";
import { Controller } from "@flamework/core"

export type RunData = {
    offset: CFrame
}

@Controller()
export class ViewmodelController {
    model;
    animator;

    private camera = Workspace.CurrentCamera as Camera;

    constructor() {
        this.model = ReplicatedStorage.Assets.Viewmodels.Default.Clone();
        this.animator = this.model.AnimationController.Animator;
        
        this.Init();
    }

    private Init() {
        this.model.Parent = this.camera;
        Object.SetPhysics(this.model, false, false);
    }

    setViewmodelCFrame(cframe: CFrame) {
        this.model.PivotTo(cframe);
    }
}