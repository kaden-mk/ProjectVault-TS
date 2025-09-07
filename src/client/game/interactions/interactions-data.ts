import { FormatStandard } from "@rbxts/format-number";
import { ReplicatedStorage } from "@rbxts/services";
import { Loot } from "shared/game/data/loot";
import { Interactable } from "./interactions";

export default {
    "Instant-Loot": {
        Text: (object: Instance) => `to take the ${object.Name}`
    },
    "Loot": {
        Text: (object: Instance) =>
            `to ${object.Name === "Bag" ? "pick up" : "bag"} the ${object.GetAttribute("Loot")} ($${FormatStandard(Loot.value(object.GetAttribute("Loot") as keyof typeof Loot.value))})`
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