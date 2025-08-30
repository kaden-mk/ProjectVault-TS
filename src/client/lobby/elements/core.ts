import { Players } from "@rbxts/services"

type ValidElement = new (mainGui: MainGui) => BaseElement;

const elementList = new Map<string, ValidElement>

const mainGui = Players.LocalPlayer.WaitForChild("PlayerGui").WaitForChild("MainGui", math.huge) as unknown as MainGui;

export class BaseElement {
    mainGui = mainGui;

    onStart() {}
}

export function Element() {
    return function(validElement: ValidElement) {
        elementList.set(tostring(validElement), validElement);
    }
}

export namespace ElementCore {
    let initialized = false;
    
    export function init() {
        if (initialized) {
            warn("Elements have already been initialized!");
            return;
        }

        initialized = true;

        elementList.forEach((ElementClass, key) => {
            const element = new ElementClass(mainGui);
            element.onStart();
        });
    }

    export function get() {
        return mainGui;
    }
}