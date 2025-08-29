import { Controller, OnStart } from "@flamework/core"
import { SoundRegistry } from "client/universal/dependencies/sound"

@Controller()
export class SoundController implements OnStart {
    onStart() {
        SoundRegistry.register("Hover", {
            SoundId: "5054289267",
            Volume: 1
        })

        SoundRegistry.register("Click", {
            SoundId: "18844651131",
            Volume: 1
        })

        // TODO: make sound registry for ingame (or just make it shared?)
        SoundRegistry.register("Objective", {
            SoundId: "5496925234",
            Volume: 1
        })
    }
}