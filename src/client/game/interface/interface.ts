import { Controller, OnStart } from "@flamework/core";
import { Players, UserInputService } from "@rbxts/services";
import { Message, messaging } from "shared/game/messaging";
import { UITil } from "../modules/ui-til";
import { PlayerController } from "../player/player-controller";

@Controller()
export class Interface implements OnStart {
    startingGui;

    private state = {
        ready: true
    }

    constructor(private playerController: PlayerController) {
        this.startingGui = Players.LocalPlayer.WaitForChild("PlayerGui").WaitForChild("StartingGui") as StartingGui;
    }

    onGameStateUpdated() {
        const startingFrame = this.startingGui.StartingFrame;

        UITil.UpdateTake(this.playerController.replicatedGameState.take());

        if (this.state.ready === true) {
            const playersReady = this.playerController.replicatedGameState.playersReady();

            startingFrame.TextLabel.Text = 
                `Players: ${playersReady}/${Players.GetPlayers().size()}`;

            if (playersReady >= Players.GetPlayers().size()) {
                this.state.ready = false;
                UITil.Fade(startingFrame, "out");
                this.playerController.player.CameraMode = Enum.CameraMode.LockFirstPerson;
                UserInputService.MouseIconEnabled = false;
            }
        }
    }
    
    onStart() {
        const startingFrame = this.startingGui.StartingFrame;
        startingFrame.Visible = true;

        startingFrame.TextButton.Activated.Once(() => {
            messaging.server.emit(Message.playerReadyUp);
        });

        this.onGameStateUpdated();

        this.playerController.gameStateUpdated.Connect(() => this.onGameStateUpdated());
    }
}