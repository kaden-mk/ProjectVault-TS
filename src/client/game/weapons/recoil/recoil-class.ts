import { Spring } from "client/game/modules/spring";
import { RecoilProfile, RecoilProfileType } from "./recoil-profile";

export class Recoil {
    private continousFireTime = 0;

    // base springs
    private cameraSpring = new Spring();
    private viewmodelSpringPos = new Spring();
    private viewmodelSpringRot = new Spring();

    // shake springs
    private cameraShakeSpring = new Spring(700, 50);
    private viewmodelShakeSpring = new Spring(900, 55);

    // micro shake springs
    private cameraMicroShakeSpring = new Spring(1200, 65);
    private viewmodelMicroShakeSpring = new Spring(1400, 60);

    private cameraKickSpring = new Spring(2500, 40);

    constructor(private camera: Camera, private profile: RecoilProfileType) {
        this.SwitchProfile(profile);
    }

    SwitchProfile(newProfile: RecoilProfileType) {
        this.profile = newProfile;

        this.cameraSpring.Change(this.profile.CameraStiffness * 2, this.profile.CameraDamping);
        this.viewmodelSpringPos.Change(this.profile.ViewmodelKick * this.profile.ViewmodelKickSpeed, this.profile.RecoverySpeed * 0.5);
        this.viewmodelSpringRot.Change(this.profile.ViewmodelTilt * 80, this.profile.RecoverySpeed * 0.35);
    }

    Fire() {
        this.continousFireTime += 1 / this.profile.RPM;

        const durationScale = math.min(this.continousFireTime / 2, 1);
        const shotMultiplier = 1 + math.max(durationScale, 0.5) * this.profile.ContinuousFireMultiplier;

        const { h, v, roll } = RecoilProfile.evaluateShot(this.profile);

        const randomH = (math.random() - 0.5) * 2 * this.profile.HorizontalPower * 0.4;
        const randomV = (math.random() - 0.5) * 2 * this.profile.VerticalPower * 0.4;
        const microH = (math.random() - 0.5) * 2 * this.profile.MicroShakeIntensity * 0.2;
        const microV = (math.random() - 0.5) * 2 * this.profile.MicroShakeIntensity * 0.2;

        const recoilH = (h + randomH) * shotMultiplier * this.profile.CameraMultiplier;
        const recoilV = (v + randomV) * shotMultiplier * this.profile.CameraMultiplier;

        this.cameraSpring.Shove(new Vector3(recoilH, recoilV, 0));
        this.cameraShakeSpring.Shove(new Vector3(randomH * 2, randomV * 2, 0).mul(this.profile.CameraMultiplier));
        this.cameraMicroShakeSpring.Shove(new Vector3(microH, microV, 0).mul(this.profile.CameraMultiplier));

        const tiltMultiplier = this.profile.ViewmodelTilt;
        const kickMultiplier = this.profile.ViewmodelKick;
        const vmMultiplier = this.profile.ViewmodelMultiplier;

        let pitchTilt = -v * tiltMultiplier * 1.8 * shotMultiplier;
        let yawTilt   =  h * tiltMultiplier * 0.8 * shotMultiplier;

        pitchTilt += -this.profile.VerticalBias * tiltMultiplier * 0.3;
        yawTilt  += this.profile.HorizontalBias * tiltMultiplier;

        pitchTilt += randomV * 0.5 * tiltMultiplier;
        yawTilt   += randomH * 0.5 * tiltMultiplier;

        const rollTilt = ((roll + randomV * 1.2) - (this.profile.RollBias)) * tiltMultiplier * 0.6;

        this.viewmodelSpringRot.Shove(new Vector3(
            pitchTilt * 1.3,
            yawTilt * 1.3,
            rollTilt * 1.3
        ));

        const baseKick = new Vector3(
            -h * 0.12 * vmMultiplier,
            -v * 0.08 * vmMultiplier,
            1.2 * kickMultiplier
        );

        this.viewmodelSpringPos.target = Vector3.zero;
        this.viewmodelSpringPos.Shove(baseKick);

        this.viewmodelShakeSpring.Shove(new Vector3(randomV * 3, randomH * 3, roll));
        this.viewmodelMicroShakeSpring.Shove(new Vector3(microV, microH, roll));

        const kickPower = this.profile.CameraKick * this.profile.CameraMultiplier;
        const kickPos = new Vector3(
            (math.random() - 0.5) * 0.2 * kickPower,
            (math.random() - 0.5) * 0.2 * kickPower, 
            0.5 * kickPower
        );
        const kickRot = new Vector3(
            (math.random() - 0.5) * 2 * kickPower,  
            (math.random() - 0.5) * 2 * kickPower,   
            (math.random() - 0.5) * 2 * kickPower    
        );

        this.cameraKickSpring.Shove(kickPos.add(kickRot).mul(1.5));
    }

    // return the cframe needed to update the viewmodel position
    public Update(dt: number) {
        const camOffset = this.cameraSpring.Update(dt);
        const camShake = this.cameraShakeSpring.Update(dt);
        const camMicro = this.cameraMicroShakeSpring.Update(dt);
        const camKick = this.cameraKickSpring.Update(dt);

        const vmPos = this.viewmodelSpringPos.Update(dt);
        const vmRot = this.viewmodelSpringRot.Update(dt);
        const vmShake = this.viewmodelShakeSpring.Update(dt);
        const vmMicro = this.viewmodelMicroShakeSpring.Update(dt);

        const pitch = math.rad(camOffset.Y + camShake.Y + camMicro.Y);
        const yaw = math.rad(-(camOffset.X + camShake.X + camMicro.X));
        const roll = math.rad((camShake.X - camShake.Y) * 0.6 + camMicro.X * 0.2);

        this.camera.CFrame = this.camera.CFrame
            .mul(CFrame.Angles(pitch, yaw, roll))
            .mul(new CFrame(camKick));

        const finalPosition = vmPos.add(vmShake.mul(0.02)).add(vmMicro.mul(0.02));
        const clampedPosition = new Vector3(
            math.clamp(finalPosition.X, -1.5, 1.5),
            math.clamp(finalPosition.Y, -1, 1),
            math.clamp(finalPosition.Z, -this.profile.ViewmodelKickLimit, this.profile.ViewmodelKickLimit)
        );
        const finalRotation = CFrame.Angles(
            math.rad(-vmRot.X + vmShake.X * 25 + vmMicro.X * 10),
            math.rad(vmRot.Y + vmShake.Y * 25 + vmMicro.Y * 10),
            math.rad(vmRot.Z + vmShake.Z * 25 + vmMicro.Z * 10)
        );

        return new CFrame(clampedPosition).mul(finalRotation);
    }

    public ResetPattern() {
        this.continousFireTime = 0;
        this.cameraSpring.Reset();
        this.cameraShakeSpring.Reset();
        this.cameraMicroShakeSpring.Reset();
        this.viewmodelSpringPos.Reset();
        this.viewmodelSpringRot.Reset();
        this.viewmodelShakeSpring.Reset();
        this.viewmodelMicroShakeSpring.Reset();
    }
}