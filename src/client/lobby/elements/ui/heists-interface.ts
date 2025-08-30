import { Element, BaseElement } from "client/lobby/elements/core"
import { SoundRegistry } from "client/universal/dependencies/sound"
import { Message, messaging } from "shared/lobby/messaging"

import heists from "client/universal/data/heists"

export function open(mainGui: MainGui) {
    mainGui.Menu.Visible = false;
    mainGui.Menus.Heists.Visible = true;
}

@Element()
export class HeistsInterface extends BaseElement {
    constructor() {
        super();
    }

    // TODO: make this somehow automatically choose the first heist
    private selectedHeist = heists["bank"]; 

    private colors = {
        "easy": Color3.fromRGB(0, 205, 0),
        "normal": Color3.fromRGB(0, 0, 150),
        "hard": Color3.fromRGB(150, 0, 0)
    }

    private interface = this.mainGui.Menus.Heists;
    private left = this.interface.Left;
    private right = this.interface.Right;

    private createButton(key: string, data: typeof heists[keyof typeof heists], template: TextButton) {
        const button = template.Clone();
        button.Visible = true;
        button.Name = key;

        button.Text = data.name;
        button.Parent = this.left;

        /* TODO: somehow use button registartion */

        button.MouseButton1Down.Connect(() => {
            SoundRegistry.play("Click", true);
            this.selectedHeist = data;

            this.update();
        })
    }

    private update() {
        const imageLabel = this.right.ImageLabel;
        const heistName = this.right.Heist;
        const description = this.right.Description;

        imageLabel.Image = `rbxassetid://${tostring(this.selectedHeist.icon)}`
        heistName.Text = this.selectedHeist.name;
        heistName.TextColor3 = this.colors[this.selectedHeist.difficulty as never];
        description.Text = this.selectedHeist.description;
    }

    onStart() {
        const heistTemplate = this.left.Template;

        const exit = this.interface.TextButton;
        exit.MouseButton1Click.Connect(() => {
            this.interface.Visible = false;
            this.mainGui.Menu.Visible = true;

            SoundRegistry.play("Click", true);
        })

        const play = this.right.PlayButton;
        play.MouseButton1Click.Connect(() => {
            SoundRegistry.play("Click", true);
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