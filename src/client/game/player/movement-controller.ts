import { Controller, OnStart } from "@flamework/core";
import { Input } from "../input/input-class";
import { PlayerController } from "./player-controller";

@Controller()
export class MovementController implements OnStart {
    private inputController = new Input();

    constructor(private playerController: PlayerController) {}

    InitializeInputs() {
        //  this is shit (ive never made a movement system in my life and theres also no anti cheat)
        this.inputController.Bind("Run", Enum.KeyCode.LeftShift, true, (input, ended) => {
            if (!this.playerController.state.masked) return;

            this.playerController.state.running = !ended;
            
            const humanoid = this.playerController.player.Character?.FindFirstChildOfClass("Humanoid");
            if (!humanoid) return;

            humanoid.WalkSpeed = ended ? 16 : 24;
        });
    }

    onStart() {
        this.InitializeInputs();
        this.inputController.Init();
    }
}