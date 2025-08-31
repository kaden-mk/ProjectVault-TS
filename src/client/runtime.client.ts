import { Flamework } from "@flamework/core";
import { Workspace } from "@rbxts/services";

const typeAttribute = Workspace.GetAttribute("Type");

if (typeAttribute === "Game") {
    //Flamework.addPaths("src/client/game/classes");
    Flamework.addPaths("src/client/game");
    //Flamework.addPaths("src/shared/game/components");
} else if (typeAttribute === "Lobby") {
    Flamework.addPaths("src/client/lobby/controllers");
    Flamework.addPaths("src/client/lobby/elements");
}

Flamework.ignite();