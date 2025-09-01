import { Controller } from "@flamework/core";
import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { Object } from "shared/game/dependencies/object-util";

export type RunData = {
    offset: CFrame
}

@Controller()
export class ViewmodelController {
    model;
    animator;

    private camera = Workspace.CurrentCamera as Camera;
    private fakeCamera: BasePart;
    private oldCameraCFrame = CFrame.identity; // for the fake camera

    constructor() {
        this.model = ReplicatedStorage.Assets.Viewmodels.Default.Clone();
        this.animator = this.model.AnimationController.Animator;
        this.fakeCamera = this.model.FindFirstChild("FakeCamera") as BasePart;
        
        this.Init();
    }

    private Init() {
        this.model.Parent = this.camera;
        Object.SetPhysics(this.model, false, false);
    }

    setViewmodelCFrame(cframe: CFrame) {
        this.model.PivotTo(cframe);
    }

    updateFakeCamera() {
        const newCameraCFrame = this.fakeCamera.CFrame.ToObjectSpace(this.model.PrimaryPart!.CFrame);
        Workspace.CurrentCamera!.CFrame = Workspace.CurrentCamera!.CFrame.mul(newCameraCFrame.ToObjectSpace(this.oldCameraCFrame));
        this.oldCameraCFrame = newCameraCFrame;
    }
}