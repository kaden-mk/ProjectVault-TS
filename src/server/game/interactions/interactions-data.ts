import { Interaction } from "server/game/interactions/interactions";
import { NewPlayer } from "../players/player-class";

import { gameState } from "../state/game-state";

import { TweenService } from "@rbxts/services";

interface Door extends Interaction {
    tweenOpen: Tween,
    tweenClose: Tween
}

export default {
    "Instant-Loot": {
        callback: (object: Interaction, interactionType: string | undefined) => {
            object.destroy();
            gameState.take(gameState.take() + 1000);
        }
    },
    "Loot": {
        callback: (object: Interaction, interactionType: string | undefined) => {
            if (interactionType === "End")
                object.destroy();

            return true;
        }
    },
    "Door": {
        onInit: (object: Door) => {
            const hinge = object.instance!.WaitForChild("Doorframe").WaitForChild("Hinge") as Part;

            object.tweenOpen = TweenService.Create(hinge, new TweenInfo(1), {
                CFrame: hinge.CFrame.mul(CFrame.Angles(0, math.rad(90), 0))
            });
            object.tweenClose = TweenService.Create(hinge, new TweenInfo(1), {
                CFrame: hinge.CFrame.mul(CFrame.Angles(0, 0, 0))
            });
        },

        callback: (object: Door, interactionType: string | undefined) => {
            const isOpen = object.instance!.GetAttribute("Open");

            isOpen ? object.tweenClose.Play() : object.tweenOpen.Play();

            const sound = object.instance!.WaitForChild("Base").WaitForChild("Sound") as Sound;
            sound.Play();

            object.instance!.SetAttribute("Open", !isOpen);
        }
    },
    "Mask": {
        callback: (object: Interaction, interactionType: string | undefined, player: NewPlayer) => {
            if (object.id !== `Mask_Equip_${player.player.Name}`) return;

            if (interactionType === "End") {
                object.destroy();
                player.atomState.masked(true);
            }
        }
    }
}