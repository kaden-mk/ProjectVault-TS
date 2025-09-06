import { BaseComponent, Component } from "@flamework/components";
import { Interaction } from "server/game/interactions/interactions";
import interactionsShared from "shared/game/data/interactions";

@Component({ tag: "Interactable" })
export class InteractionsComponent extends BaseComponent<{ Type: string }> {
    private interaction: Interaction;

    constructor() {
        super();
        this.interaction = new Interaction(this.attributes.Type as keyof typeof interactionsShared, this.instance);
    }

    public onInteract(player: Player) {
        return this.interaction.onInteract(player);
    }

    public cancelInteraction(player: Player) {
        return this.interaction.cancelInteraction(player);
    }

    public destroy() {
        this.interaction.destroy();
    }
}