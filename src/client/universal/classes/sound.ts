type SoundDataOptions = {
    properties?: { [key: string]: any };
};

const SoundGui = new Instance("ScreenGui");
SoundGui.Name = "SoundGui";
SoundGui.ResetOnSpawn = false;
SoundGui.Parent = game.GetService("Players").LocalPlayer.WaitForChild("PlayerGui");

const soundCache: { [name: string]: SoundData } = {};

export function getSound(name: string) {
    return soundCache[name];
}

export class SoundData {
    sound: Sound;

    constructor(name: string, data: SoundDataOptions) {
        this.sound = new Instance("Sound");
        this.sound.Name = name;

        // loop through data and set properties
        for (const [key, value] of pairs(data.properties ?? {})) {
            (this.sound as any)[key] = key === "SoundId" ? `rbxassetid://${value}` : value;
        }

        this.sound.Parent = SoundGui;

        soundCache[name] = this;
    }

    play(newInstance?: boolean) {
        if (!newInstance) {
            this.sound.Play();
            return;
        }

        const soundClone = this.sound.Clone();
        soundClone.Parent = SoundGui;
        soundClone.Play();

        soundClone.Ended.Connect(() => {
            soundClone.Destroy();
        });
    }
}

// Sound list (could this be a seperate module?)
new SoundData("Hover", { properties: {
    SoundId: "5054289267",
    Volume: 1
}  });

new SoundData("Click", { properties: {
    SoundId: "18844651131",
    Volume: 1
} })

new SoundData("Objective", { properties: {
    SoundId: "5496925234",
    Volume: 1
} })