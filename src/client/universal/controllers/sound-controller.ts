import { Controller, OnStart } from "@flamework/core"
import { SoundRegistry } from "client/universal/dependencies/sound"

@Controller()
export class SoundController implements OnStart {
    onStart() {
        SoundRegistry.register("Hover", {
            SoundId: "89795415922557",
            Volume: 1
        })

        SoundRegistry.register("Click", {
            SoundId: "100343570403749",
            Volume: 1
        })

        SoundRegistry.register("Objective", {
            SoundId: "5496925234",
            Volume: 1
        })
    
        SoundRegistry.register("AmmoPickup", {
            SoundId: "86885048048454",
            Volume: 1
        })
    }
}