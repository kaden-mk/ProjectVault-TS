import { FormatStandard } from "@rbxts/format-number";
import { Players, RunService, TweenService } from "@rbxts/services";

const player = Players.LocalPlayer;

export namespace UITil {
    const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
    const mainGui = playerGui.WaitForChild("MainGui") as GameGui;

    const interactionFrame = mainGui.Interact;
    const interactionLabel = interactionFrame.Text;
    const interactionBackground = interactionFrame.Background;
    const interactionProgress = interactionFrame.Progress;

    const topLeft = mainGui.TopLeft;

    const crosshair = mainGui.Crosshair;

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

    export function Crosshair(show: boolean) {
        const transparency = show ? 0 : 1;

        TweenService.Create(crosshair, new TweenInfo(0.15, Enum.EasingStyle.Sine), {
            ImageTransparency: transparency
        }).Play();
    }

    let currentTake = 0;

    export function UpdateTake(take: number) {
        const start = currentTake;
        const last = take;
        const duration = 1;
        const steps = 30;
        const stepTime = duration / steps;

        task.spawn(() => {            
            for (let step = 1; step <= steps; step++) {
                const progress = step / steps;
                const value = math.floor(start + (last - start) * progress);
                topLeft.TextLabel.Text = `Take: $${FormatStandard(value)}`;
                task.wait(stepTime);
            }
            currentTake = last;
        });
    }

    export function Fade(ior: "out" | "in", frame?: Frame, duration?: number)  {
        frame = frame ? frame : mainGui.BlackScreen;

        const tweenInfo = new TweenInfo(duration ? duration : 1);
        const transparency = ior === "out" ? 1 : 0
        
        TweenService.Create(frame, tweenInfo, {
            BackgroundTransparency: transparency
        }).Play()

        const items = [ "TextButton", "Frame", "TextLabel" ]

        for (const [_, item] of pairs(frame.GetChildren())) {
            if (!items.includes(item.ClassName)) continue;

            type tweenData = {
                BackgroundTransparency: number
                TextTransparency?: number
            }

            const data: tweenData = {
                BackgroundTransparency: transparency
            }

            if (item.ClassName === "TextButton" || item.ClassName === "TextLabel")
                data.TextTransparency = transparency

            TweenService.Create(item, tweenInfo, data as never).Play()
        }
    }
} 