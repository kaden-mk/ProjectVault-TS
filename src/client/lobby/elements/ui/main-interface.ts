import { Element, BaseElement } from "client/lobby/elements/core"
import { ElementButton } from "client/lobby/elements/button"
import { Workspace, RunService } from "@rbxts/services"

import { open as openHeists } from "./heists-interface"

@Element()
export class UIHandler extends BaseElement {
    constructor() {
        super();
    }

    onStart() {
        this.mainGui.Enabled = true;

        ElementButton.register(this.mainGui.Menu.Play, openHeists);
        ElementButton.register(this.mainGui.Menu.Inventory);

        Workspace.MainMenu.Play();

        RunService.RenderStepped.Connect(() => this.update());
    }  

    private update() {
        Workspace.CurrentCamera!.CFrame = Workspace.CameraSet.CFrame;
    }
}