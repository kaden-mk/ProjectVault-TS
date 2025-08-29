import { Interactions } from "server/game/components/interactions";

export default {
    "Instant-Loot": {
        callback: (object: Interactions, interactionType: string | undefined) => {
            object.destroy();
        }
    },
    "Loot": {
        callback: (object: Interactions, interactionType: string | undefined) => {
            if (interactionType === "End")
                object.destroy();

            return true;
        }
    }
}