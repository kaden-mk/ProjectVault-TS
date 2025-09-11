import { Players, Workspace } from "@rbxts/services";
import { SafeTeleport } from "server/universal/modules/safe-teleport";

export namespace HeistMap {
    let map: Model | undefined = undefined;

    export function load(model: Model): Model {
        if (map) return map as Model;

        const clone = model.Clone();
        clone.Name = "Map";
        clone.Parent = Workspace;

        map = clone;

        return clone;
    }

    export function destroy() {
        if (!map) return;

        map.Destroy();

        SafeTeleport(71535347093193, Players.GetPlayers());
    }
}