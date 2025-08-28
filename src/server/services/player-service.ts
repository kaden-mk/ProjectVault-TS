import { Service, OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";
import { NewPlayer } from "server/classes/player-class";
import { ServerSyncer } from "@rbxts/charm-sync";
import { atom } from "@rbxts/charm";
import { messaging, Message } from "shared/messaging";

import atoms from "shared/data/atoms";
import CharmSync from "@rbxts/charm-sync";

// shout ot to l.iquid on discord for being a big helper and support and i will always appreciate his work
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
        messaging.server.on(Message.requestSessionState, player => {
            playerSyncers.get(player)?.hydrate(player);
        })

        Players.PlayerAdded.Connect((player) => {
            const playerState = ConstructNewPlayerState();

            const playerClass = new NewPlayer(player, playerState);
            this.registeredPlayers[player.Name] = playerClass;

            SetupSyncerForState(player, playerState);
        })
        
        Players.PlayerRemoving.Connect((player) => {
            delete this.registeredPlayers[player.Name];
        })
    }

    GetPlayer(player: Player) {
        return this.registeredPlayers[player.Name];
    }
}