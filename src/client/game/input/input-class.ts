import { UserInputService } from "@rbxts/services";

type InputValue = Enum.KeyCode | Enum.UserInputType;

interface Binding {
	code: InputValue | InputValue[];
	ends: boolean;
	callback: (input: InputObject, ended: boolean) => undefined;
}

export class Input {
	enabled = true;

	private bindings: { [key: string]: Binding } = {};
	private activeInputs = new Map<InputValue, InputObject>();

	private MatchesInput(code: InputValue | InputValue[], input: InputValue): boolean {
		if (typeIs(code, "table")) {
			code = code as InputValue[];
			for (let i = 0; i < code.size(); i++) {
				if (code[i] === input) return true;
			}
			return false;
		}
		return code === input;
	}

	private FindBinding(input: InputValue): Binding | false {
		for (const [_, data] of pairs(this.bindings)) {
			if (this.MatchesInput(data.code, input)) {
				return data;
			}
		}
		return false;
	}

	public Bind(inputName: string, code: InputValue | InputValue[], ends: boolean, callback: (input: InputObject, ended: boolean) => undefined) {
		if (this.bindings[inputName] !== undefined) return;
		this.bindings[inputName] = { code, ends, callback };
		return this.bindings[inputName];
	}

	public Unbind(inputName: string) {
		delete this.bindings[inputName];
	}

	public Init() {
		UserInputService.InputBegan.Connect((input, gameProcessedEvent) => {
			if (gameProcessedEvent && input.UserInputType === Enum.UserInputType.Keyboard) return;
			if (!this.enabled) return;

			const inputType = input.UserInputType !== Enum.UserInputType.Keyboard ? input.UserInputType : input.KeyCode;
			const binding = this.FindBinding(inputType);
			if (binding === false) return;

			this.activeInputs.set(inputType, input);
			binding.callback(input, false);
		});

		UserInputService.InputEnded.Connect((input, gameProcessedEvent) => {
			if (gameProcessedEvent && input.UserInputType === Enum.UserInputType.Keyboard) return;
			if (!this.enabled) return;

			const inputType = input.UserInputType !== Enum.UserInputType.Keyboard ? input.UserInputType : input.KeyCode;
			const binding = this.FindBinding(inputType);
			if (binding === false) return;
			if (!binding.ends) return;

			this.activeInputs.delete(inputType);
			binding.callback(input, true);
		});

		UserInputService.WindowFocusReleased.Connect(() => {
			this.activeInputs.forEach((input, inputType) => {
				const binding = this.FindBinding(inputType);
				
				if (binding && binding.ends) 
					binding.callback(input, true);
			});

			this.activeInputs.clear();
		});
	}
}