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

    private bobbingSpring = new Spring(200, 20);
    private swaySpring = new Spring(350, 45);
    private runningSpring = new Spring(350, 45);
    private runningSpringRot = new Spring(350, 45);
    private movementSpring = new Spring(350, 45);
    private strafeSpring = new Spring(350, 45);

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

        task.delay(loadedAnimation.Length - 0.03, () => {
            UITil.Fade("in", undefined, 0.1);
            task.wait(0.15);
            maskClone.Destroy();
            UITil.Fade("out", undefined, 0.1);
        });

        loadedAnimation.Play();
    }

    private getBobbing(addition: number, speed: number, modifier: number) {
        return math.sin(tick() * addition * speed) * modifier;
    }

    getBobbingAndSwayOffsets(dt: number, running: boolean) {
        const delta = game.GetService("UserInputService").GetMouseDelta();
        this.swaySpring.Shove(new Vector3(-delta.X / 50, delta.Y / 50, 0));

        const character = game.GetService("Players").LocalPlayer.Character;
        const humanoidRootPart = character?.PrimaryPart;
        if (!humanoidRootPart) return;

        const modifier = 1;
        const bobAmount = new Vector3(
            this.getBobbing(5, 2, modifier),
            this.getBobbing(10, 2, modifier),
            0
        );
        this.bobbingSpring.Shove(bobAmount.div(10).mul(humanoidRootPart.AssemblyLinearVelocity.Magnitude / 10));

        const swayOffset = this.swaySpring.Update(dt);
        const swayCFrame = new CFrame(swayOffset.X, swayOffset.Y, 0).mul(CFrame.Angles(0, -swayOffset.X, swayOffset.Y));

        const bobOffset = this.bobbingSpring.Update(dt);
        const bobCFrame = new CFrame(bobOffset.X, bobOffset.Y, bobOffset.Z);

        const targetPos = running ? new Vector3(-0.15, -0.2, 0.2) : new Vector3(0, 0, 0);
        const targetRot = running ? new Vector3(0, math.rad(20), math.rad(25)) : new Vector3(0, 0, 0);

        this.runningSpring.Shove(targetPos.sub(this.runningSpring.target));
        this.runningSpring.target = targetPos;

        this.runningSpringRot.Shove(targetRot.sub(this.runningSpringRot.target));
        this.runningSpringRot.target = targetRot;

        const runOffset = this.runningSpring.Update(dt);
        const runRotOffset = this.runningSpringRot.Update(dt);
        const runCFrame = new CFrame(runOffset.X, runOffset.Y, runOffset.Z).mul(CFrame.Angles(0, runRotOffset.Y, runRotOffset.Z));

        const rootCFrame = humanoidRootPart.CFrame;
        const velocity = humanoidRootPart.AssemblyLinearVelocity;
        const localVelocity = rootCFrame.VectorToObjectSpace(velocity);

        this.movementSpring.Shove(new Vector3(
            -localVelocity.X / 50,
            0,
            -localVelocity.Z / 35
        ));

        const moveOffset = this.movementSpring.Update(dt);
        const moveCFrame = new CFrame(moveOffset.X, moveOffset.Y, moveOffset.Z);

        const strafeTilt = -localVelocity.X / 200;

        this.strafeSpring.target = new Vector3(0, 0, strafeTilt);

        const moveRotOffset = this.strafeSpring.Update(dt);
        const moveRotCFrame = CFrame.Angles(0, 0, moveRotOffset.Z);

        return swayCFrame.mul(bobCFrame).mul(runCFrame).mul(moveCFrame).mul(moveRotCFrame);
    }
}