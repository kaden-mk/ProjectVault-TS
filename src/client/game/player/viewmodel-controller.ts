import { Controller } from "@flamework/core";
import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { UITil } from "client/game/modules/ui-til";
import { Object } from "shared/game/dependencies/object-util";
import { Spring } from "../modules/spring";

@Controller()
export class ViewmodelController {
    model;
    animator;

    private camera = Workspace.CurrentCamera as Camera;
    private fakeCamera: BasePart;
    private oldCameraCFrame = CFrame.identity; // for the fake camera

    bobbingSpring = new Spring(200, 20);
    swaySpring = new Spring(350, 45);
    runningSpring = new Spring(350, 45);
    runningSpringRot = new Spring(350, 45);
    movementSpring = new Spring(350, 45);
    strafeSpring = new Spring(350, 45);

    constructor() {
        this.model = ReplicatedStorage.Assets.Viewmodels.Default.Clone();
        this.animator = this.model.AnimationController.Animator;
        this.fakeCamera = this.model.FindFirstChild("FakeCamera") as BasePart;
        Object.SetPhysics(this.model, false, false);

        this.Init();
    }

    private Init() {
        this.model.Parent = this.camera;
    }

    setViewmodelCFrame(cframe: CFrame) {
        this.model.PivotTo(cframe);
    }

    updateFakeCamera() {
        const newCameraCFrame = this.fakeCamera.CFrame.ToObjectSpace(this.model.PrimaryPart!.CFrame);
        Workspace.CurrentCamera!.CFrame = Workspace.CurrentCamera!.CFrame.mul(newCameraCFrame.ToObjectSpace(this.oldCameraCFrame));
        this.oldCameraCFrame = newCameraCFrame;
    }

    playAnimation(animation: Animation) {
        const loadedAnimation = this.animator.LoadAnimation(animation);
        loadedAnimation.Play();
    }

    mask(mask: ReplicatedStorage["Assets"]["Masks"][string]) {
        const loadedAnimation = this.animator.LoadAnimation(mask.Animation);
        const maskClone = mask.Part.Clone();
        maskClone.Parent = this.model;

        Object.Rig(this.model.WaitForChild("Right Arm") as BasePart, maskClone, maskClone.GetAttribute("C0") as CFrame);

        loadedAnimation.Ended.Connect(() => {
            UITil.Fade("in", undefined, 0.1);
            task.wait(0.05);
            maskClone.Destroy();
            task.wait(0.05);
            UITil.Fade("out", undefined, 0.2);
        });

        loadedAnimation.Play();
    }
}