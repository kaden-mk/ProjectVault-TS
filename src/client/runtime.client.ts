import { Flamework } from "@flamework/core";
import { Workspace } from "@rbxts/services";
import { ElementCore } from "client/lobby/elements/core";

const typeAttribute = Workspace.GetAttribute("Type");

Flamework.addPaths("src/client/universal/controllers");

if (typeAttribute === "Game") {
    Flamework.addPaths("src/client/game");
} else if (typeAttribute === "Lobby") {
    Flamework.addPaths("src/client/lobby");
    ElementCore.init();
}

Flamework.ignite();