import Signal from "@rbxts/signal";
import { UITil } from "client/game/modules/ui-til";
import { SoundRegistry } from "client/universal/dependencies/sound";
import { Message, messaging } from "shared/game/messaging";
import { PlayerController } from "../player/player-controller";
import { ViewmodelController } from "../player/viewmodel-controller";

import interactionsShared from "shared/game/data/interactions";
import interactionsClient from "./interactions-data";

export class Interactable {
    readonly data;
    readonly clientData;

    onInteractionEnded = new Signal();

    private destroyed = false;

    private callback?;

    constructor(attributeType: keyof typeof interactionsShared, private id: string, private playerController: PlayerController, public viewmodelController: ViewmodelController) {
        this.data = interactionsShared[attributeType];

        this.clientData = interactionsClient[attributeType];
        if ("Callback" in this.clientData)
            this.callback = this.clientData.Callback;
    }

    public onInteract() {
        if (this.destroyed) return;
        if (!messaging.server.invoke(Message.startInteraction, Message.startInteractionReturn, { interaction: this.id }).await()[1]) return;

        if (this.data.Type === "Instant") {
            this.callback?.(this, undefined);
            this.onInteractionEnded.Fire();

            if ("Sound" in this.data)
                SoundRegistry.play(this.data.Sound);
            return;
        }

        this.playerController.state.currentInteraction = this;

        const waitTime = this.data.Type === "Wait" && "WaitTime" in this.data ? this.data.WaitTime : 1;
        const startTime = tick();

        this.callback?.(this, "Start");

        while (!(tick() - startTime >= waitTime)) {
            if (this.playerController.state.currentInteraction !== this || this.destroyed) {
                UITil.UpdateInteractionProgressBar(-1);
                return;
            }

            UITil.UpdateInteractionProgressBar((tick() - startTime) / waitTime);
            task.wait();
        }

        UITil.UpdateInteractionProgressBar(-1);
        this.playerController.state.currentInteraction = undefined;

        this.callback?.(this, "End");
        this.onInteractionEnded.Fire();

        if ("Sound" in this.data)
            SoundRegistry.play(this.data.Sound);
    }

    public cancelInteraction() {
        if (this.playerController.state.currentInteraction !== this || this.destroyed) return;

        messaging.server.emit(Message.cancelInteraction);
        this.playerController.state.currentInteraction = undefined;
    }

    public destroy() {
        this.destroyed = true;

        if (this.playerController.state.currentInteraction === this) 
            this.playerController.state.currentInteraction = undefined;
    }
}