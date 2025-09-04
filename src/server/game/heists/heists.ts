import { Controller } from "@flamework/core";
import { ServerStorage } from "@rbxts/services";
import { HeistMap } from "./map";

@Controller()
export class HeistController {
    map: Model | undefined;
    
    init(mapName: string) {
        let model = ServerStorage.Assets.Maps.FindFirstChild(mapName);

        if (!model)
            model = ServerStorage.Assets.Maps.Test;

        this.map = HeistMap.load(model as Model);
    }
}