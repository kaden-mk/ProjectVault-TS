import { Workspace } from "@rbxts/services";

export namespace HeistMap {
    export function load(model: Model): Model {
        if (Workspace.FindFirstChild("Map")) return Workspace.WaitForChild("Map") as Model;

        const clone = model.Clone();
        clone.Name = "Map";
        clone.Parent = Workspace;

        return clone;
    }
}