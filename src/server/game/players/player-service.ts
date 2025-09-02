import { OnStart, Service } from "@flamework/core";
import { atom } from "@rbxts/charm";
import { ServerSyncer } from "@rbxts/charm-sync";
import { Players } from "@rbxts/services";
import { NewPlayer } from "server/game/players/player-class";
import { gameState } from "server/game/state/game-state";
import { Message, messaging } from "shared/game/messaging";

import CharmSync from "@rbxts/charm-sync";
// TODO: make this 1 module
import atoms from "shared/game/data/player-atoms";

let playerSyncers = new Map<Player, ServerSyncer<{}, true>>();

function SetupSyncerForState(player: Player, state: typeof atoms) {
    const syncer = CharmSync.server({
        atoms: state
    });

    playerSyncers.set(player, syncer);

    syncer.connect((_, payload) => messaging.client.emit(player, Message.playerSessionSync, payload));
}

const ConstructNewPlayerState = () => ({
    test: atom(0)
}) satisfies typeof atoms;

@Service()
export class PlayerService implements OnStart {
    registeredPlayers: { [key: string]: NewPlayer } = {};

    onStart() {
        // game state
        const gameSyncer = CharmSync.server({
            atoms: gameState
        });

        gameSyncer.connect((_, payload) => {
            for (const [player] of playerSyncers) {
                messaging.client.emit(player, Message.gameSessionSync, payload);
            }
        });

        messaging.server.on(Message.requestSessionState, player => {
            playerSyncers.get(player)?.hydrate(player);
        })

        Players.PlayerAdded.Connect((player) => {
            const playerState = ConstructNewPlayerState();

            const playerClass = new NewPlayer(player, playerState);
            this.registeredPlayers[player.Name] = playerClass;

            SetupSyncerForState(player, playerState);

            gameSyncer.hydrate(player);
        })
        
        Players.PlayerRemoving.Connect((player) => {
            delete this.registeredPlayers[player.Name];
        })
    }

    GetPlayer(player: Player) {
        return this.registeredPlayers[player.Name];
    }
}