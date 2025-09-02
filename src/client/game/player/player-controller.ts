import { Controller, OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";
import { Message, messaging } from "shared/game/messaging";
import { UITil } from "../modules/ui-til";

import CharmSync from "@rbxts/charm-sync";

import gameAtoms from "shared/game/data/game-atoms";
import atoms from "shared/game/data/player-atoms";

@Controller()
export class PlayerController implements OnStart {
    public player = Players.LocalPlayer;

    public replicatedPlayerState = table.clone(atoms); 
    public replicatedGameState = table.clone(gameAtoms);

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

        messaging.client.on(Message.gameSessionSync, payload => {
            this.gameSyncer.sync(payload);

            UITil.UpdateTake(payload.data.take!);
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