import { OnStart, Service } from "@flamework/core";
import { atom } from "@rbxts/charm";
import { ServerSyncer } from "@rbxts/charm-sync";
import { Players, ReplicatedStorage, StarterPlayer } from "@rbxts/services";
import { NewPlayer, RemovePlayer } from "server/game/players/player-class";
import { gameState } from "server/game/state/game-state";
import { Message, messaging } from "shared/game/messaging";
import { HeistController } from "../heists/heists";
import { Interaction } from "../interactions/interactions";

import CharmSync from "@rbxts/charm-sync";
// TODO: make this 1 module
import atoms from "shared/game/data/player-atoms";

const playerSyncers = new Map<Player, ServerSyncer<{}, true>>();

function SetupSyncerForState(player: Player, state: typeof atoms) {
    const syncer = CharmSync.server({
        atoms: state
    });

    playerSyncers.set(player, syncer);

    syncer.connect((_, payload) => messaging.client.emit(player, Message.playerSessionSync, payload));
}

const ConstructNewPlayerState = () => ({
    masked: atom(false)
}) satisfies typeof atoms;

@Service()
export class PlayerService implements OnStart {
    constructor(private heistController: HeistController) {}

    onStart() {
        // game state
        const gameSyncer = CharmSync.server({
            atoms: gameState
        });

        gameSyncer.connect((_, payload) => {
            for (const [player] of playerSyncers) 
                messaging.client.emit(player, Message.gameSessionSync, payload);
        });

        messaging.server.on(Message.requestSessionState, player => {
            playerSyncers.get(player)?.hydrate(player);
        })

        // TODO: check for the player if they already did this or something, just fgind a better way to do this
        let gameInitialized = false;
        messaging.server.on(Message.playerReadyUp, p => {
            if (gameInitialized) return;

            gameState.playersReady(gameState.playersReady() + 1);

            if (gameState.playersReady() >= Players.GetPlayers().size()) 
                gameInitialized = true;   
        });

        Players.PlayerAdded.Connect((player) => {
            // create mask interaction
            new Interaction("Mask", undefined, `Mask_Equip_${player.Name}`);

            // character initialization
            player.CharacterAdded.Connect((character) => {
                for (const [key, value] of pairs(StarterPlayer.WaitForChild("StarterCharacterScripts").GetChildren())) 
                    value.Clone().Parent = character;
            });

            // load heist
            const tpData = player.GetJoinData().TeleportData as unknown as { heist: string, difficulty: string };
            const mapName = tpData ? tpData.heist : "Test";

            this.heistController.init(mapName);

            // player & game state
            const playerState = ConstructNewPlayerState();
            const playerClass = new NewPlayer(player, playerState);

            playerClass.LoadCharacter(ReplicatedStorage.Assets.Characters.Default, this.heistController.map?.WaitForChild("SpawnLocation") as SpawnLocation);

            SetupSyncerForState(player, playerState);

            gameSyncer.hydrate(player);
        })
        
        Players.PlayerRemoving.Connect((player) => {
            RemovePlayer(player);
        })
    }
}