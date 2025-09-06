import { Components } from "@flamework/components";
import { Controller, Dependency, OnRender, OnStart } from "@flamework/core";
import { CollectionService, Players, Workspace } from "@rbxts/services";
import { Input } from "client/game/input/input-class";
import { UITil } from "client/game/modules/ui-til";
import { PlayerController } from "../player/player-controller";
import { ViewmodelController } from "../player/viewmodel-controller";
import { Interactable } from "./interactions";
import { InteractionsComponents } from "./interactions-components";

// TODO: optimize?
function FindTagged(instance: Instance, tag: string) {
    let current: Instance | undefined = instance;
    while (current) {
        if (CollectionService.HasTag(current, tag)) return current;
        current = current.Parent;
    }
    return undefined;
}

function GetInteractableFromRay(): InteractionsComponents | undefined {
    if (Players.LocalPlayer.Character?.Parent === undefined) return undefined;

    const RaycastParameters = new RaycastParams();
    RaycastParameters.FilterType = Enum.RaycastFilterType.Exclude;
    RaycastParameters.FilterDescendantsInstances = [Players.LocalPlayer.Character!];   

    const components = Dependency<Components>();

    const ray = Workspace.Raycast(Workspace.CurrentCamera!.CFrame.Position, Workspace.CurrentCamera!.CFrame.LookVector.mul(5), RaycastParameters);
        
    if (ray && ray.Instance.IsA("BasePart")) {
        const tagged = FindTagged(ray.Instance, "Interactable");
        if (tagged) {
            const component = components.getComponent<InteractionsComponents>(tagged);
            return component;
        }
    }
}

@Controller()
export class InteractionsController implements OnStart, OnRender {
    private inputController: Input;
    private highlight: Highlight;
    private currentInteractable: InteractionsComponents | undefined = undefined;

    constructor(private playerController: PlayerController, private viewmodelController: ViewmodelController) {
        this.inputController = new Input();
        this.highlight = new Instance("Highlight");
    }

    onStart() {
        this.inputController.Init();

        this.highlight.Parent = Workspace.WaitForChild("Trash");
        this.highlight.FillColor = Color3.fromRGB(200, 200, 200);
        this.highlight.OutlineTransparency = 0;
        this.highlight.FillTransparency = 0.5;
        this.highlight.OutlineColor = Color3.fromRGB(255, 255, 255);

        this.inputController.Bind("Interact", Enum.KeyCode.F, true, (input, ended) => {
            if (!this.currentInteractable) return;

            if (ended) 
                this.currentInteractable.cancelInteraction();
            else
                this.currentInteractable.onInteract();
        });

        // masking
        const maskInteraction = new Interactable("Mask", `Mask_Equip_${this.playerController.player.Name}`, this.playerController, this.viewmodelController);

        maskInteraction.onInteractionEnded.Connect(() => {
            //this.inputController.Unbind("Mask");
        });

        this.inputController.Bind("Mask", Enum.KeyCode.G, true, (input, ended) => {
            if (ended)
                maskInteraction.cancelInteraction();
            else
                maskInteraction.onInteract();
        });
    }

    onRender() {
        this.currentInteractable = GetInteractableFromRay();

        UITil.UpdateInteractionText(this.currentInteractable?.getText() || undefined);

        this.highlight.Adornee = this.currentInteractable?.instance || undefined;
    }
}