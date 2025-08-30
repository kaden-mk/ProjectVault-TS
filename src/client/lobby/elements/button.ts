import { SoundRegistry } from "client/universal/dependencies/sound"
import { TweenService } from "@rbxts/services"
import { ElementCore } from "./core"

export namespace ElementButton {
    export function register(button: TextButton, open?: (mainGui: MainGui) => void) {
        const tweenInfo = new TweenInfo(0.1, Enum.EasingStyle.Sine);
        const interval = 1.05;

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
        })

        button.MouseButton1Up.Connect(() => {
            increaseTween.Play();
            if (open)
                open(ElementCore.get());
        })
    }
}