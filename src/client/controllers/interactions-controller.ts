import { Controller, OnRender, OnStart, Dependency } from "@flamework/core";
import { Workspace, Players } from "@rbxts/services";
import { Interactable } from "client/components/interactions";
import { Components } from "@flamework/components";
import { Input } from "client/classes/input-class";
import { UITil } from "client/utility/ui-til";

const components = Dependency<Components>();

function GetInteractableFromRay(): Interactable | undefined {
    if (Players.LocalPlayer.Character?.Parent === undefined) return undefined;

    const RaycastParameters = new RaycastParams();
    RaycastParameters.FilterType = Enum.RaycastFilterType.Exclude;
    RaycastParameters.FilterDescendantsInstances = [Players.LocalPlayer.Character!];   

    const ray = Workspace.Raycast(Workspace.CurrentCamera!.CFrame.Position, Workspace.CurrentCamera!.CFrame.LookVector.mul(5), RaycastParameters);
    if (ray && ray.Instance.IsA("BasePart") && ray.Instance.Parent && ray.Instance.HasTag("Interactable")) {
        const component = components.getComponent<Interactable>(ray.Instance);
        return component;
    } 
}

@Controller()
export class InteractionsController implements OnStart, OnRender {
    private inputController: Input;
    private highlight: Highlight;
    private currentInteractable: Interactable | undefined = undefined;

    constructor() {
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
    }

    onRender() {
        this.currentInteractable = GetInteractableFromRay();

        UITil.UpdateInteractionText(this.currentInteractable?.getText() || undefined);

        this.highlight.Adornee = this.currentInteractable?.instance || undefined;
    }
}