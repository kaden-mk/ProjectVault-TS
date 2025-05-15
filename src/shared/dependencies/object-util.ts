export namespace Object {
    export function SetPhysics(object: Model, anchored: boolean, canCollide: boolean) {
        for (const descendant of object.GetDescendants()) {
            if (!descendant.IsA("BasePart")) continue;

            print(descendant);

            descendant.Anchored = anchored;
            descendant.CanCollide = canCollide;
        }
    }

    export function FindPartFromTag(object: Model, tag: string) {
        for (const descendant of object.GetDescendants()) {
            if (!descendant.HasTag(tag)) continue;

            return descendant;
        }
    }

    export function Rig(part0: BasePart, part1: BasePart, c0?: CFrame, c1?: CFrame) {
        const motor = new Instance("Motor6D");
        motor.Part0 = part0;
        motor.Part1 = part1;
        motor.Parent = part0;

        if (c0) motor.C0 = c0;
        if (c1) motor.C1 = c1;

        return motor;
    }
}