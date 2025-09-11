import { GetPlayer, NewPlayer } from "server/game/players/player-class";
import { Object } from "shared/game/dependencies/object-util";
import { gameState } from "../state/game-state";

import weapons from "shared/game/data/weapons";

const RNG = new Random();

export class Weapon {
    readonly name;
    readonly data;
    readonly owner;

    public model: Model;

    private animations: { [key: string]: AnimationTrack } = {};
    private sounds: { [key: string]: Sound } = {};

    private state = {
        isEnabled: false,
        isEquipped: false,
        isFiring: false,
        isReloading: false
    };
    private cooldown;

    constructor(readonly weaponName: keyof typeof weapons, owner: Player) {
        this.owner = GetPlayer(owner) as NewPlayer;
        this.name = weaponName;
        this.data = weapons[weaponName];
        this.cooldown = 1 / (this.data.RPM / 60);
        this.model = this.data.Model.Clone();

        this.InitializeRig();
        this.InitializeSounds();
        this.InitializeAnimations();
    }

    private InitializeRig() {
        const rig = this.data.Rig;

        for (const [key, data] of pairs(rig.WM)) {
            const part0 = Object.FindByPath(this.owner.player.Character as Model, data.Part0) as BasePart;
            const part1 = Object.FindByPath(this.model, data.Part1) as BasePart;

            if (part0 && part1) 
                Object.Rig(part0, part1, data.C0);
        }
    }

    private InitializeSounds() {
        for (const sound of this.model.FindFirstChild("Sounds")!.GetChildren()) {
            if (sound.IsA("Sound") === false) continue;

            this.sounds[sound.Name] = sound;
        }
    }

    private InitializeAnimations() {
        if (this.owner.player.Character === undefined) return;
        if (this.owner.player.Character.FindFirstChildOfClass("Humanoid") === undefined) return;

        for (const anim of this.model.FindFirstChild("Animations")!.FindFirstChild("TP")!.GetChildren()) {
            if (anim.IsA("Animation") === false) continue;

            this.animations[anim.Name] = this.owner.player.Character.FindFirstChild("Humanoid")!.FindFirstChildOfClass("Animator")!.LoadAnimation(anim as Animation);
        }
    }

    Equip() {
        if (this.owner.weaponState.canDoAnything === false) return false;
        if (this.owner.GetEquippedWeapon() !== undefined) return false;
        if (this.owner.atomState.masked() === false) return false;
        if (gameState.ended() === true) return false;

        this.model.Parent = this.owner.player.Character;
        Object.SetPhysics(this.model, false, false);

        this.sounds.Equip.Play();

        this.owner.weaponState.canDoAnything = false;

        task.delay(this.data.EquipTime, () => {
            this.state.isEquipped = true;
            this.state.isEnabled = true;

            this.owner.EquipWeapon(this.name);
            this.owner.weaponState.canDoAnything = true;
        })

        return true;
    }

    Fire(startCFrame: CFrame) {
        // holy fuck (i need to clean this up :sob:)
        if (this.owner.weaponState.canDoAnything === false) return false;
        if (this.state.isEquipped === false) return false;
        if (this.state.isEnabled === false) return false;
        if (this.state.isFiring === true) return false;
        if (this.state.isReloading === true) return false; // TODO: add cancel reloading
        if (gameState.ended() === true) return false;

        this.state.isFiring = true;
        task.delay(this.cooldown, () => {
            this.state.isFiring = false;
        })

        const fireSound = this.sounds.Fire.Clone();
        fireSound.Parent = this.owner.player.Character?.PrimaryPart;
        fireSound.PlaybackSpeed = RNG.NextNumber(0.9, 1.2);
        fireSound.Play();

        fireSound.Ended.Connect(() => {
            fireSound.Destroy();
        })

        return true;
    }
}