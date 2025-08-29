import { Controller, OnRender, OnStart } from "@flamework/core";
import { Players, Workspace } from "@rbxts/services";
import { Button } from "./button";
import { UIHANDLER_Heists } from "./handlers/heists"

const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui") as UIInterface;

@Controller()
export class UIController implements OnStart, OnRender {
    onStart() {
        const mainGui = playerGui.WaitForChild("MainGui") as UIInterface["MainGui"];
        mainGui.Enabled = true;
        
        const mainTheme = Workspace.WaitForChild("MainMenu") as Sound;
        mainTheme.Play();

        // i seriously need to improve this
        new UIHANDLER_Heists(mainGui.Menus.Heists).Initialize();

        Button.register(mainGui.Menu.Play, mainGui.Menus.Heists);
        Button.register(mainGui.Menu.Inventory);
    }

    onRender() {
        const cameraSet = Workspace.WaitForChild("CameraSet") as Part;
        Workspace.CurrentCamera!.CFrame = cameraSet.CFrame;
    }
}