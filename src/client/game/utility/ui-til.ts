import { Players, RunService } from "@rbxts/services";

const player = Players.LocalPlayer;

const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
const mainGui = playerGui.WaitForChild("MainGui") as ScreenGui;

const interactionFrame = mainGui.WaitForChild("Interact") as Frame;
const interactionLabel = interactionFrame.WaitForChild("Text") as TextLabel;
const interactionBackground = interactionFrame.WaitForChild("Background") as Frame;
const interactionProgress = interactionFrame.WaitForChild("Progress") as Frame;

export namespace UITil {
    export function UpdateInteractionText(text: string | undefined) {
        if (!text) {
            interactionLabel.Visible = false;
            return;
        }

        interactionLabel.Text = text;
        RunService.Heartbeat.Wait();
        interactionLabel.Visible = true;
    }

    export function UpdateInteractionProgressBar(progress: number) {
        if (progress === -1) {
            interactionBackground.Visible = false;
            interactionProgress.Visible = false;
            return;
        }
        
        interactionProgress.Size = new UDim2(progress, 0, 0.75, 0);
        
        interactionBackground.Visible = true;
        interactionProgress.Visible = true;
    }
} 