// the main weapon class, handles and creates weapons

import { Workspace } from "@rbxts/services"
import weapons from "shared/game/data/weapons";
import { Object } from "shared/game/dependencies/object-util";

import { Recoil } from "client/game/classes/recoil/recoil-class"
import { RecoilProfile } from "client/game/classes/recoil/recoil-profile"

import Signal from "@rbxts/lemon-signal";
import { messaging, Message } from "shared/game/messaging";
import { Viewmodel } from "./viewmodel-class";
import { NewPlayer } from "./player-class";

export namespace WeaponUtil {
    export function DoesWeaponExist(weapon: keyof typeof weapons) {
        return weapons[weapon] !== undefined; 
    }
}

const RNG = new Random();

export class Weapon {
    public name;

    public readonly data;

    private model;
    private animations: { [key: string]: AnimationTrack } = {};
    private sounds: { [key: string]: Sound } = {};

    private state = {
        isEnabled: false,
        isEquipped: false,
        canFire: true,
    };

    public recoil;

    private cooldown;

    public signals = {
        unEquipped: new Signal(),
    }

    constructor(readonly weaponName: keyof typeof weapons, private playerController: NewPlayer, private viewmodelController: Viewmodel) {        
        if (!messaging.server.invoke(Message.createWeapon, Message.createWeaponReturn, { weaponName: weaponName })) throw `Weapon ${weaponName} does not exist!`;
        
        this.name = weaponName;
        this.data = weapons[weaponName];
        this.cooldown = 1 / (this.data.RPM / 60);
        this.model = this.data.Model.Clone();

        const recoilProfile = RecoilProfile.create(this.data.Recoil);
        recoilProfile.RPM = this.data.RPM;

        this.recoil = new Recoil(Workspace.CurrentCamera!, recoilProfile);

        this.InitializeRig();
        this.InitializeAnimations();
        this.InitializeSounds();
    }

    InitializeAnimations() {
        for (const anim of this.model.FindFirstChild("Animations")!.FindFirstChild("VM")!.GetChildren()) {
            if (anim.IsA("Animation") === false) continue;

            this.animations[anim.Name] = this.viewmodelController.animator.LoadAnimation(anim as Animation);
        }
    }

    InitializeSounds() {
        for (const sound of this.model.FindFirstChild("Sounds")!.GetChildren()) {
            if (sound.IsA("Sound") === false) continue;

            this.sounds[sound.Name] = sound;
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
        if (this.state.canFire === false) return;

        this.state.canFire = false;
        task.delay(this.cooldown, () => {
            this.state.canFire = true;
        })

        this.animations.Fire.Play();
        this.recoil.Fire();

        /* TODO MAKE THIS IN THE SERVER */
        const fireSound = this.sounds.Fire.Clone();
        fireSound.Parent = this.playerController.player.Character?.PrimaryPart;
        fireSound.PlaybackSpeed = RNG.NextNumber(0.9, 1.2);
        fireSound.Play();

        fireSound.Ended.Connect(() => {
            fireSound.Destroy();
        })
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