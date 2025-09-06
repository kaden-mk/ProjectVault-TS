import { ReplicatedStorage } from "@rbxts/services";
import { Interactable } from "./interactions";

export default {
    "Instant-Loot": {
        Text: (object: Instance) => `to take the ${object.Name}`
    },
    "Loot": {
        Text: (object: Instance) => `to bag the ${object.Name}`
    },
    "Door": {
        Text: (object: Instance) => `to ${object.GetAttribute("Open") ? "close" : "open"} the door`
    },
    "Mask": {
        Callback: (interaction: Interactable, interactionType: "Start" | "End" | undefined) => {
            if (interactionType === "End") {
                interaction.destroy();
                interaction.viewmodelController.mask(ReplicatedStorage.Assets.Masks.Balaclava);
            }
        }
    }
}