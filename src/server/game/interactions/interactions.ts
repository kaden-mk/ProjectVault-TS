import { HttpService } from "@rbxts/services";
import { GetPlayer } from "../players/player-class";

import interactionsServer from "server/game/interactions/interactions-data";
import interactionsShared from "shared/game/data/interactions";

const interactions: { [id: string]: Interaction } = {};

export function GetInteractionFromId(id: string) {
    return interactions[id];
}

export class Interaction {
    private data;
    readonly id;
    
    instance?: Instance;
    private callback;

    constructor(interactionType: keyof typeof interactionsShared, instance?: Instance, id?: string) {
        if (id) this.id = id; else this.id = HttpService.GenerateGUID(false);

        this.instance = instance
        if (instance) instance.SetAttribute("Id", this.id);

        interactions[this.id] = this;
        
        this.data = interactionsShared[interactionType];

        const interactionServerData = interactionsServer[interactionType as keyof typeof interactionsServer];
        this.callback = interactionServerData.callback;

        (interactionServerData as any).onInit?.(this);
    }

    private getPosition() {
        const modelOrPart = this.instance as Model | BasePart;
        return modelOrPart.GetPivot().Position;
    }

    private isPlayerNearby(player: Player) {
        if (!this.instance) return true;

        const character = player.Character;
        if (!character || !character.Parent) return false;

        return character.GetPivot().Position.sub(this.getPosition()).Magnitude <= 8;
    }

    public onInteract(player: Player) {
        if (!this.isPlayerNearby(player)) return false;

        const playerData = GetPlayer(player);

        if (!playerData) return false;
        if (playerData.state.activeInteraction) return false;
        if (playerData.atomState.masked() === false && this.data.Mask === true) return false;

        if (this.data.Type === "Instant") {
            this.callback?.(this as any, undefined, playerData);
            return false;
        }

        if (this.callback && this.callback(this as any, "Start", playerData) === false) return false;

        playerData.state.activeInteraction = this.id;

        const startTime = tick();
        const waitTime = this.data.Type === "Wait" && "WaitTime" in this.data ? this.data.WaitTime : 1;

        task.spawn(() => {
            let go = true

            while (tick() - startTime < waitTime) {
                if (playerData.state.activeInteraction !== this.id) {
                    go = false;
                    break;
                }
                if (!this.isPlayerNearby(player)) {
                    playerData.state.activeInteraction = undefined;
                    go = false;
                    break;
                }
                task.wait();
            }

            if (!go) return;

            playerData.state.activeInteraction = undefined;
            this.callback?.(this as any, "End", playerData);
        });

        return true;
    }

    public cancelInteraction(player: Player) {
        const playerData = GetPlayer(player);

        if (playerData === undefined) return;
        if (playerData.state.activeInteraction !== this.id) return;

        playerData.state.activeInteraction = undefined;
    }

    public destroy() {
        this.instance?.Destroy();
        delete interactions[this.id];
    }
}