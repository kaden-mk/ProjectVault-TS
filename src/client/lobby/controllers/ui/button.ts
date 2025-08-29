import { TweenService, Players } from "@rbxts/services"
import { SoundRegistry } from "client/universal/dependencies/sound"

const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui") as UIInterface;

export namespace Button {
    const tweenInfo = new TweenInfo(0.1, Enum.EasingStyle.Sine);
    const interval = 1.05;

    export function register(button: TextButton, frame?: Frame) {
        const buttonSize = button.Size;

        const increaseTween = TweenService.Create(button, tweenInfo, {
            Size: UDim2.fromOffset(buttonSize.X.Offset * interval, buttonSize.Y.Offset * interval)
        })

        const decreaseTween = TweenService.Create(button, tweenInfo, {
            Size: UDim2.fromOffset(buttonSize.X.Offset / interval, buttonSize.Y.Offset / interval)
        })

        /* TO IMPROVE */

        button.MouseEnter.Connect(() => {
            SoundRegistry.play("Hover", true);

            increaseTween.Play();
        })

        button.MouseLeave.Connect(() => {
            decreaseTween.Play();
        })

        button.MouseButton1Down.Connect(() => {
            SoundRegistry.play("Click", true);
            decreaseTween.Play();

            if (frame) {
                // assuming this is the main menu (maybe add some sort of way to customize it man idk)
                playerGui.MainGui.Menu.Visible = false;
                frame.Visible = true;
            }
        })

        button.MouseButton1Up.Connect(() => {
            increaseTween.Play();
        })
    }
}