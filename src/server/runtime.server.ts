import { Flamework } from "@flamework/core";
import { Workspace } from "@rbxts/services";

if (Workspace.GetAttribute("Type") === "Game") {
    Flamework.addPaths("src/server/game");
} else if (Workspace.GetAttribute("Type") === "Lobby") {
    Flamework.addPaths("src/server/lobby/services");
}

Flamework.ignite();