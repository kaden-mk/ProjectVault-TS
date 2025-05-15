import { UserInputService } from "@rbxts/services"

export namespace Input {
    interface binding {
        code: Enum.KeyCode | Enum.UserInputType,
        ends: boolean,
        callback: () => undefined
    }


    const bindings: { [key: string]: binding } = {};

    function FindBinding(input: Enum.KeyCode | Enum.UserInputType) {
        for (const [key, data] of pairs(bindings)) {
            if (data.code === input) return data;
        }

        return false;
    }

    export function Bind(inputName: string, inputCode: Enum.KeyCode | Enum.UserInputType, ends: boolean, callback: () => undefined) {
        if (bindings[inputName] !== undefined) return;

        bindings[inputName] = {
            code: inputCode,
            ends: ends,
            callback: callback
        };

        return bindings[inputName];
    }

    UserInputService.InputBegan.Connect((input, gameProcessedEvent) => {
        if (gameProcessedEvent) return;

        const inputType = input.UserInputType !== Enum.UserInputType.Keyboard ? input.UserInputType : input.KeyCode;

        const data = FindBinding(inputType);
        
        if (data === false) return;

        data.callback();
    })
}