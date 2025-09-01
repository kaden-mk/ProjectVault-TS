import { Flamework } from "@flamework/core";
import { Workspace } from "@rbxts/services";

const typeAttribute = Workspace.GetAttribute("Type");

if (typeAttribute === "Game") {
    Flamework.addPaths("src/client/game");
} else if (typeAttribute === "Lobby") {
    Flamework.addPaths("src/client/lobby/controllers");
    Flamework.addPaths("src/client/lobby/elements");
}

Flamework.ignite();