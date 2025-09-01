import { Interactions } from "server/game/components/interactions";

import { TweenService } from "@rbxts/services";

interface Door extends Interactions {
    tweenOpen: Tween,
    tweenClose: Tween
}

export default {
    "Instant-Loot": {
        callback: (object: Interactions, interactionType: string | undefined) => {
            object.destroy();
        }
    },
    "Loot": {
        callback: (object: Interactions, interactionType: string | undefined) => {
            if (interactionType === "End")
                object.destroy();

            return true;
        }
    },
    "Door": {
        onInit: (object: Door) => {
            const hinge = object.instance.WaitForChild("Doorframe").WaitForChild("Hinge") as Part;

            object.tweenOpen = TweenService.Create(hinge, new TweenInfo(1), {
                CFrame: hinge.CFrame.mul(CFrame.Angles(0, math.rad(90), 0))
            })
            object.tweenClose = TweenService.Create(hinge, new TweenInfo(1), {
                CFrame: hinge.CFrame.mul(CFrame.Angles(0, 0, 0))
            })
        },

        callback: (object: Door, interactionType: string | undefined) => {
            const hinge = object.instance.WaitForChild("Doorframe").WaitForChild("Hinge") as Part;

            const isOpen = object.instance.GetAttribute("Open")

            isOpen ? object.tweenClose.Play() : object.tweenOpen.Play();

            const sound = object.instance.WaitForChild("Base").WaitForChild("Sound") as Sound;
            sound.Play();

            object.instance.SetAttribute("Open", !isOpen)
        }
    }
}