import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";

@Component({
    tag: "Interactable"
})
export class Interactable extends BaseComponent<{ Type: string }> implements OnStart {
    constructor() {
        super();
    }

    public onInteract() {
    
    }

    onStart() {}
}