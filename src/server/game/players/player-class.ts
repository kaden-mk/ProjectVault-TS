import atoms from "shared/game/data/player-atoms";

import { ReplicatedStorage } from "@rbxts/services";
import { Object } from "shared/game/dependencies/object-util";

export function GetPlayer(player: Player) {
    return playerClasses.get(player);
}

export function RemovePlayer(player: Player) {
    playerClasses.delete(player);
}

const playerClasses = new Map<Player, NewPlayer>();

export class NewPlayer {
    readonly player;

    public state = {
        equippedWeapon: undefined as string | undefined,
        activeInteraction: undefined as string | undefined,
    };

    public weaponState = {
        canDoAnything: true,
    }
    // set this to private soon?
    public inventory = {        
        weapons: {} as { [key: string]: boolean },
    }
    
    public atomState: typeof atoms;

    constructor(readonly playerItem: Player, playerState: typeof atoms) {
        this.atomState = playerState;
        this.player = playerItem;
        this.inventory.weapons = {
            M4A1: true,
            M1911: true
        };

        playerClasses.set(playerItem, this);
    }

    EquipWeapon(weapon: string) {
        if (this.state.equippedWeapon === weapon) return;

        this.state.equippedWeapon = weapon;
    }

    GetEquippedWeapon() {
        return this.state.equippedWeapon;
    }

    LoadCharacter(character: Model, cframe?: CFrame | BasePart) {
        const clone = character.Clone();
        clone.Name = this.player.Name;

        this.player.Character = clone;
        this.player.Character.Parent = game.Workspace;
        
        if (cframe) {
            const pivotCFrame = typeOf(cframe) === "CFrame" ? (cframe as CFrame) : (cframe as BasePart).CFrame;
            this.player.Character.PivotTo(pivotCFrame.add(new Vector3(0, 1, 0)));
        }

        for (const [_, part] of pairs(character.GetDescendants()))
            if (part.IsA("BasePart"))
                part.CollisionGroup = "Player";
    }

    Bag(loot: string) {
        if (loot === undefined) return false;
        if (this.atomState.bagged() !== "undefined") return false;
        if (!this.player.Character || !this.player.Character.Parent) return false;

        this.atomState.bagged(loot);

        // TODO: maybe make this take a bag arg?
        const c0 = new CFrame(0.078, 0.233, 1.084).mul(CFrame.Angles(0, math.rad(180), math.rad(23.02)));
        const clone = ReplicatedStorage.Assets.Bags.Default.Clone();
        clone.Name = loot;
        clone.Anchored = false;
        clone.CanCollide = true;
        clone.CollisionGroup = "NoPlayerCollide";
        
        Object.Rig(clone, this.player.Character.WaitForChild("Torso") as BasePart, c0);

        clone.Parent = this.player.Character;

        return true;
    }

    ThrowBag(throwDirection: Vector3) {
        if (this.atomState.bagged() === "undefined") return false;
        if (!this.player.Character || !this.player.Character.Parent) return false;
        if (!this.player.Character.FindFirstChild(this.atomState.bagged() as string)) return false;

        const bag = this.player.Character.FindFirstChild(this.atomState.bagged() as string) as BasePart;
        bag.FindFirstChildOfClass("Motor6D")?.Destroy();

        bag.Name = "Bag";
        bag.SetAttribute("Loot", this.atomState.bagged());
        bag.SetAttribute("Type", "Loot");
        bag.Parent = game.Workspace;

        bag.AddTag("Interactable");
        this.atomState.bagged("undefined");

        bag.AssemblyLinearVelocity = throwDirection.mul(50);
    }
}