import { PlayerService } from "server/game/players/player-service";
import weapons from "shared/game/data/weapons";

export class Weapon {
    readonly name;
    readonly data;
    readonly owner;

    public model: Model;
    private animations: { [key: string]: AnimationTrack } = {};
    private state = {
        isEnabled: false,
        isEquipped: false,
    };

    constructor(readonly weaponName: keyof typeof weapons, owner: Player, private playerService: PlayerService) {
        this.owner = playerService.GetPlayer(owner);
        this.name = weaponName;
        this.data = weapons[weaponName];
        this.model = this.data.Model.Clone();

        this.InitializeAnimations();
    }

    InitializeAnimations() {
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

        this.owner.weaponState.canDoAnything = false;

        task.delay(this.data.EquipTime, () => {
            this.state.isEquipped = true;
            this.state.isEnabled = true;

            this.owner.EquipWeapon(this.name);
            this.owner.weaponState.canDoAnything = true;
        })

        return true;
    }
}