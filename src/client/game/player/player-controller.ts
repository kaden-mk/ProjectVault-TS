import { Controller, OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";
import { Message, messaging } from "shared/game/messaging";

import CharmSync from "@rbxts/charm-sync";
import Signal from "@rbxts/signal";

import gameAtoms from "shared/game/data/game-atoms";
import atoms from "shared/game/data/player-atoms";

@Controller()
export class PlayerController implements OnStart {
    public player = Players.LocalPlayer;

    public replicatedPlayerState = table.clone(atoms); 
    public replicatedGameState = table.clone(gameAtoms);

    public gameStateUpdated = new Signal();

    private syncer = CharmSync.client({
        atoms: this.replicatedPlayerState
    });

    private gameSyncer = CharmSync.client({
        atoms: this.replicatedGameState
    });

    private state : { [key: string]: string | undefined } = {
        equippedWeapon: undefined
    }

    onStart() {
        messaging.client.on(Message.playerSessionSync, payload => {
            this.syncer.sync(payload);
        });

        // TODO: add a signal to this
        messaging.client.on(Message.gameSessionSync, payload => {
            this.gameSyncer.sync(payload);
            this.gameStateUpdated.Fire();
        });

        messaging.server.emit(Message.requestSessionState);
    }

    EquipWeapon(weaponName?: string) {
        this.state.equippedWeapon = weaponName; 
    }

    DoesPlayerHaveAWeaponEquipped() {
        return this.state.equippedWeapon;
    }
}