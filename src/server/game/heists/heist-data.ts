import { HeistManager } from "./heist-manager";

interface MAP_Test {
    DropOff: Part,
    EscapePoint: Part
}

export default {
    "Test": {
        init(manager: HeistManager, map: Model & MAP_Test) {
            // objectives
            const testObjective = "test";
            const escapeObjective = "escape";

            manager.createObjective(testObjective, "Deliver a bag of cash", "stealth", () => {
                let connection: RBXScriptConnection | undefined;

                connection = manager.onLootDeliver.Connect((loot) => {
                    if (loot !== "Money") return;

                    manager.setObjective(escapeObjective);
                    connection?.Disconnect();
                });
            });

            manager.createObjective(escapeObjective, "Escape", "stealth", () => {
                manager.setEscapePoint(map.EscapePoint);
            });

            manager.setObjective(testObjective);

            // loot 
            manager.setLootPoint(map.DropOff);
        }
    }
}