const SoundGui = new Instance("ScreenGui");
SoundGui.Name = "SoundGui";
SoundGui.ResetOnSpawn = false;
SoundGui.Parent = game.GetService("Players").LocalPlayer.WaitForChild("PlayerGui");

const soundCache: { [name: string]: Sound } = {};

export namespace SoundRegistry {
    export function register(name: string, data: { [key: string]: any }) {
        const sound = new Instance("Sound");
        sound.Name = name;

        // loop through data and set properties
        for (const [key, value] of pairs(data)) {
            (sound as any)[key] = key === "SoundId" ? `rbxassetid://${value}` : value;
        }

        sound.Parent = SoundGui;

        soundCache[name] = sound;
    }

    export function play(name: string, newInstance?: boolean) {
        const sound = get(name);

        if (!sound) return;

        if (!newInstance) {
            sound.Play();
            return;
        }

        const soundClone = sound.Clone();
        soundClone.Parent = SoundGui;
        soundClone.Play();

        soundClone.Ended.Connect(() => {
            soundClone.Destroy();
        });
    }

    export function get(name: string) {
        return soundCache[name];
    }
}