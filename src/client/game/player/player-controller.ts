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
    public onMask = new Signal();

    private syncer = CharmSync.client({
        atoms: this.replicatedPlayerState
    });

    private gameSyncer = CharmSync.client({
        atoms: this.replicatedGameState
    });

    state: { equippedWeapon: string | undefined, currentInteraction: unknown | undefined, masked: boolean, running: boolean } = {
        equippedWeapon: undefined,
        currentInteraction: undefined,
        masked: false,
        running: false
    }

    onStart() {
        messaging.client.on(Message.playerSessionSync, payload => {
            this.syncer.sync(payload);

            // to improve?
            if (payload.data.masked) {
                this.state.masked = payload.data.masked;
                this.onMask.Fire();
            }
        });

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