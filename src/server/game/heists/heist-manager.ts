import { Components } from "@flamework/components";
import { Dependency } from "@flamework/core";
import { Players, RunService, Workspace } from "@rbxts/services";
import { Loot, LootValue } from "shared/game/data/loot";
import { InteractionsComponent } from "../interactions/interactions-components";
import { gameState } from "../state/game-state";
import { HeistMap } from "./map";

import Signal from "@rbxts/signal";

import storage from "../modules/storage";
import heistData from "./heist-data";

type HeistState = "stealth" | "loud";

type Objective = {
    name: string;
    state: HeistState;
    ended: boolean;
    callback: () => void;
};

export class HeistManager {
    private data;
    private lootPoint: BasePart | undefined;
    private escapePoint: BasePart | undefined;
    private state: HeistState = "stealth";
    private objectives: { [id: string]: Objective } = {};
    private currentObjective: string | undefined = undefined;

    onLootDeliver = new Signal<(loot: LootValue) => void>();

    constructor(heist: keyof typeof heistData) {
        this.data = heistData[heist];
    } 

    private lootPointHandler(components: Components, lootPointOverlapParams: OverlapParams, lootQueue: BasePart[]) {
        if (!this.lootPoint) return;

        lootPointOverlapParams.FilterDescendantsInstances = storage.Bags.GetChildren();

        const parts = Workspace.GetPartBoundsInBox(this.lootPoint.CFrame, this.lootPoint.Size, lootPointOverlapParams);
        for (const [key, value] of pairs(parts)) {
            if (lootQueue.includes(value)) continue;

            const component = components.getComponent<InteractionsComponent>(value);
            if (!component) continue;

            lootQueue.push(value);
            task.delay(2, () => {
                lootQueue.remove(lootQueue.findIndex((v) => v === value));
                this.onLootDeliver.Fire(component.instance.GetAttribute("Loot") as LootValue);
                gameState.take(gameState.take() + Loot.value(component.instance.GetAttribute("Loot") as LootValue));
                component.destroy();
            });
        } 
    }

    private escaped() {
        gameState.ended(true);
        this.escapePoint = undefined;

        task.delay(3, HeistMap.destroy);
        
        for (const [key, player] of pairs(Players.GetPlayers())) {
            const humanoid = player.Character?.FindFirstChildOfClass("Humanoid");
            if (!humanoid) continue;

            humanoid.WalkSpeed = 0;
            humanoid.JumpPower = 0;

            player.Character!.PrimaryPart!.Anchored = true;
        }
    }

    private escapePointHandler(escapePointOverlapParams: OverlapParams, startTick: number) {
        if (!this.escapePoint) return tick();

        const characters: Model[] = [];
        for (const [_, player] of pairs(Players.GetPlayers())) {
            if (!player.Character) continue;

            characters.push(player.Character);
        }

        escapePointOverlapParams.FilterDescendantsInstances = characters;

        const parts = Workspace.GetPartBoundsInBox(this.escapePoint.CFrame, this.escapePoint.Size, escapePointOverlapParams);
        const playersQueue: Player[] = [];
        for (const [_, part] of pairs(parts)) {
            const character: Model = part.Parent as Model;
            const player = Players.GetPlayerFromCharacter(character);

            if (!player) continue;
            if (playersQueue.includes(player)) continue;

            playersQueue.push(player);
        }

        if (playersQueue.size() < Players.GetPlayers().size()) return tick();

        if (tick() - startTick >= 2)
            this.escaped();

        return startTick;
    }

    start() {
        this.data.init(this, Workspace.WaitForChild("Map") as any);

        const components = Dependency<Components>();

        // loot point
        const lootPointOverlapParams = new OverlapParams();
        lootPointOverlapParams.FilterDescendantsInstances = [];
        lootPointOverlapParams.FilterType = Enum.RaycastFilterType.Include;

        const lootQueue: BasePart[] = [];

        // escape point
        const escapePointOverlapParams = new OverlapParams();
        escapePointOverlapParams.FilterDescendantsInstances = [];
        escapePointOverlapParams.FilterType = Enum.RaycastFilterType.Include;

        let startTick = tick();

        RunService.Heartbeat.Connect(() => {
            this.lootPointHandler(components, lootPointOverlapParams, lootQueue);
            startTick = this.escapePointHandler(escapePointOverlapParams, startTick);
        });
    }

    setLootPoint(part: BasePart) {
        this.lootPoint = part;
    }

    setState(state: HeistState) {
        this.state = state;
    } 

    createObjective(id: string, name: string, stateType: HeistState, callback: () => void) {
        if (this.objectives[id]) return;

        this.objectives[id] = { name: name, state: stateType, ended: false, callback: callback }
    }

    setObjective(id: string) {
        if (this.state !== this.objectives[id].state) return;
        if (!this.objectives[id] || this.objectives[id].ended === true) return;

        if (this.currentObjective !== undefined)
            this.objectives[this.currentObjective].ended = true;

        this.currentObjective = id;
        this.objectives[id].callback();
        gameState.objective(this.objectives[id].name);
    }

    setEscapePoint(point: BasePart) {
        this.escapePoint = point;
    }
}