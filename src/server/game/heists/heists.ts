import { Controller } from "@flamework/core";
import { ServerStorage } from "@rbxts/services";
import { HeistManager } from "./heist-manager";
import { HeistMap } from "./map";

@Controller()
export class HeistController {
    map: Model | undefined;

    private manager: HeistManager | undefined;

    ended = false;
    
    init(mapName: string) {
        let model = ServerStorage.Assets.Maps.FindFirstChild(mapName);

        if (!model)
            model = ServerStorage.Assets.Maps.Test;

        this.map = HeistMap.load(model as Model);
        this.manager = new HeistManager(mapName as any);
    }

    start() {
        if (!this.manager) return;

        this.manager.start();
    }
}