import { BaseComponent, Component } from "@flamework/components";
import { PlayerController } from "../player/player-controller";
import { ViewmodelController } from "../player/viewmodel-controller";
import { Interactable } from "./interactions";

import interactions from "shared/game/data/interactions";

@Component({
    tag: "Interactable"
})
export class InteractionsComponents extends BaseComponent<{ Type: string, Id: string }> {
    private interactable;
    private readonly id = this.attributes.Id;
    
    constructor(playerController: PlayerController, viewmodelController: ViewmodelController) {
        super();

        this.interactable = new Interactable(this.attributes.Type as keyof typeof interactions, this.id, playerController, viewmodelController);
    }

    public getText() {
        if (!("Text" in this.interactable.clientData)) 
            return "Not found";
        
        const HoP = this.interactable.data.Type === "Wait" ? "Hold" : "Press";
        return `${HoP} [F] ${this.interactable.clientData.Text(this.instance)}`; 
    }

    public onInteract() {
        this.interactable.onInteract();
    }

    public cancelInteraction() {
        this.interactable.cancelInteraction();
    }

    public destroy() {
        this.interactable.destroy();
        super.destroy();
    }
}