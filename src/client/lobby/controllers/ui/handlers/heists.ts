import { Players } from "@rbxts/services"
import { getSound } from "client/universal/classes/sound"
import { Message, messaging } from "shared/lobby/messaging"
import Signal from "signal"

import heists from "client/universal/data/heists"

const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui") as UIInterface;

export class UIHANDLER_Heists {
    private interface;
    private selectedHeist = heists["bank"];

    private colors = {
        "easy": Color3.fromRGB(0, 205, 0),
        "normal": Color3.fromRGB(0, 0, 150),
        "hard": Color3.fromRGB(150, 0, 0)
    }

    private left;
    private right;

    constructor(frame: UIInterface["MainGui"]["Menus"]["Heists"]) {
        this.interface = frame;
        this.left = this.interface.WaitForChild("Left") as Frame;
        this.right = this.interface.WaitForChild("Right") as Frame;
    }

    private createButton(key: string, data: typeof heists[keyof typeof heists], template: TextButton) {
        const button = template.Clone();
        button.Visible = true;
        button.Name = key;

        button.Text = data.name;
        button.Parent = this.left;

        button.MouseButton1Down.Connect(() => {
            getSound("Click").play(true);
            this.selectedHeist = data;

            this.update();
        })
    }

    private update() {
        const imageLabel = this.right.WaitForChild("ImageLabel") as ImageLabel;
        const heistName = this.right.WaitForChild("Heist") as TextLabel;
        const description = this.right.WaitForChild("Description") as TextLabel;

        imageLabel.Image = `rbxassetid://${tostring(this.selectedHeist.icon)}`
        heistName.Text = this.selectedHeist.name;
        heistName.TextColor3 = this.colors[this.selectedHeist.difficulty as never];
        description.Text = this.selectedHeist.description;
    }

    Initialize() {
        // create templates
        const heistTemplate = this.left.WaitForChild("Template") as TextButton;

        const exit = this.interface.WaitForChild("TextButton") as TextButton;
        exit.MouseButton1Click.Connect(() => {
            this.interface.Visible = false;
            playerGui.MainGui.Menu.Visible = true;
            getSound("Click").play(true);
        })

        const play = this.right.WaitForChild("PlayButton") as TextButton;
        play.MouseButton1Click.Connect(() => {
            getSound("Click").play(true);
            messaging.server.emit(Message.teleport, {
                heist: this.selectedHeist.name,
                difficulty: "normal"
            })
        })

        for (const [key, data] of pairs(heists)) {
            this.createButton(key, data, heistTemplate);
        }

        this.update();
    }
}