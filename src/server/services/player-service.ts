import { Service, OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";
import { PlayerClass } from "server/classes/player-class";
import { Events } from "server/network";

@Service()
export class PlayerService implements OnStart {
    registeredPlayers: { [key: string]: PlayerClass } = {};

    onStart() {
        Players.PlayerAdded.Connect((player) => {
            const playerClass = new PlayerClass(player);
            this.registeredPlayers[player.Name] = playerClass;
        })
        
        Players.PlayerRemoving.Connect((player) => {
            delete this.registeredPlayers[player.Name];
        })
    }

    GetPlayer(player: Player) {
        return this.registeredPlayers[player.Name];
    }
}