import { Players } from "@rbxts/services"
import { getSound } from "client/universal/classes/sound"
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

    constructor(frame: Frame) {
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
        const left = this.interface.WaitForChild("Left") as Frame;
        const heistTemplate = left.WaitForChild("Template") as TextButton;

        for (const [key, data] of pairs(heists)) {
            this.createButton(key, data, heistTemplate);
        }

        this.update();
    }
}