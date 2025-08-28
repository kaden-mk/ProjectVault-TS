import { OnStart, OnTick } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import interactions from "shared/data/interactions";

@Component({
    tag: "Interactable"
})
export class Interactions extends BaseComponent<{ Type: string }> implements OnStart, OnTick {    
    private data;

    constructor() {
        super();

        this.data = interactions[this.attributes.Type as keyof typeof interactions];
    }


    public onInteract() {
     
    }

    public cancelInteraction() {

    }

    onStart() {
        
    }

    onTick() {

    }
}