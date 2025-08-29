import { Flamework } from "@flamework/core";
import { Workspace } from "@rbxts/services";

if (Workspace.GetAttribute("Type") === "Game") {
    Flamework.addPaths("src/server/game/components");
    Flamework.addPaths("src/server/game/services");
    Flamework.addPaths("src/shared/game/components");
} else if (Workspace.GetAttribute("Type") === "Lobby") {
    Flamework.addPaths("src/server/lobby/services");
}

Flamework.ignite();