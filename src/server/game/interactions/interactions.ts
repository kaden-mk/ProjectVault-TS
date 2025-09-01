import { BaseComponent, Component } from "@flamework/components";
import { GetClassFromPlayer } from "server/game/players/player-class";

import interactionsServer from "server/game/interactions/interactions-data";
import interactions from "shared/game/data/interactions";

@Component({
    tag: "Interactable"
})
export class Interactions extends BaseComponent<{ Type: string }> {    
    private data;
    private callback;

    constructor() {
        super();

        this.data = interactions[this.attributes.Type as keyof typeof interactions];

        const interactionServerData = interactionsServer[this.attributes.Type as keyof typeof interactionsServer];
        this.callback = interactionServerData.callback;

        (interactionServerData as any).onInit?.(this)
    }

    private getPosition() {
        const instance = this.instance as Model | BasePart; // i should definitely improve this

        return instance.GetPivot().Position;
    }

    private isPlayerNearby(player: Player) {
        const character = player.Character;
        if (character === undefined || character.Parent === undefined) return false;
        // check to see if its interactable here

        return (character.GetPivot().Position.sub(this.getPosition())).Magnitude <= 8;
    }

    public onInteract(player: Player) {
        if (!this.isPlayerNearby(player)) return false;

        const playerData = GetClassFromPlayer(player);

        if (playerData === undefined) return false;
        if (playerData.state.activeInteraction !== undefined) return false;

        if (this.data.Type === "Instant") {
            this.callback?.(this as any, undefined);
            return false;
        }

        if (this.callback !== undefined) {
            const canStart = this.callback(this as any, "Start");
            if (canStart === false) return false;
        }

        playerData.state.activeInteraction = this;

        const startTime = tick();
        const waitTime = this.data.Type === "Wait" && "WaitTime" in this.data ? this.data.WaitTime : 1;
        
        task.spawn(() => {
            let go = true;

            while (!(tick() - startTime >= waitTime)) {
                if (playerData.state.activeInteraction !== this) {
                    go = false;
                    break;
                }

                // TODO: Make this a remote event
                if (!this.isPlayerNearby(player)) {
                    playerData.state.activeInteraction = undefined;
                    go = false;
                    break;
                }

                task.wait();
            }

            if (!go) return;

            playerData.state.activeInteraction = undefined;

            this.callback?.(this as any, "End");
        })

        return true;
    }

    public cancelInteraction(player: Player) {
        const playerData = GetClassFromPlayer(player);

        if (playerData === undefined) return;
        if (playerData.state.activeInteraction !== this) return;

        playerData.state.activeInteraction = undefined;
    }

    public destroy() {
        this.instance.Destroy();
    }
}