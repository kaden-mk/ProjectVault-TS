import { Flamework } from "@flamework/core";
import { Workspace } from "@rbxts/services";

const typeAttribute = Workspace.GetAttribute("Type");

Flamework.addPaths("src/client/universal/classes");

if (typeAttribute === "Game") {
    Flamework.addPaths("src/client/game/classes");
    Flamework.addPaths("src/client/game/components");
    Flamework.addPaths("src/client/game/controllers");
    Flamework.addPaths("src/shared/game/components");
} else if (typeAttribute === "Lobby") {
    Flamework.addPaths("src/client/lobby/controllers");
}

Flamework.ignite();