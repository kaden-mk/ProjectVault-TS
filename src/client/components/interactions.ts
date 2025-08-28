import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { UITil } from "client/utility/ui-til";

import interactions from "shared/data/interactions";

let activeInteraction = undefined as Interactable | undefined;

@Component({
    tag: "Interactable"
})
export class Interactable extends BaseComponent<{ Type: string }> implements OnStart {
    private data;
    
    constructor() {
        super();

        this.data = interactions[this.attributes.Type as keyof typeof interactions];
    }

    public getText() {
        const HoP = this.data.Type === "Wait" ? "Hold" : "Press";
        return `${HoP} [F] ${this.data.Text(this.instance)}`; 
    }

    public onInteract() {
        // network check here

        if (this.data.Type === "Instant") {
            //this.data.Callback?.(this);
            return;
        }

        activeInteraction = this;

        const waitTime = this.data.Type === "Wait" && "WaitTime" in this.data ? this.data.WaitTime : 1;

        //const callback = this.data.Callback;
        const startTime = tick();

        //callback?.(this, "Start"); 

        while (!(tick() - startTime >= waitTime)) {
            if (activeInteraction !== this) {
                UITil.UpdateInteractionProgressBar(-1);
                return;
            }

            UITil.UpdateInteractionProgressBar((tick() - startTime) / waitTime);
            task.wait();
        }

        UITil.UpdateInteractionProgressBar(-1);
        activeInteraction = undefined;

        //callback?.(this, "End");
    }

    public cancelInteraction() {
        if (activeInteraction !== this) return;

        // network check here
        activeInteraction = undefined;
    }

    public destroy() {
        super.destroy();
    }

    onStart() {}
}