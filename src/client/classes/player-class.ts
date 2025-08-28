import { Players } from "@rbxts/services";
import { messaging, Message } from "shared/messaging";

import CharmSync from "@rbxts/charm-sync";
import atoms from "shared/data/atoms";

// Will defo clean this up later, but for now this is fine
export class NewPlayer {
    public player = Players.LocalPlayer;
    public replicatedPlayerState = table.clone(atoms); 

    private syncer = CharmSync.client({
        atoms: this.replicatedPlayerState
    });

    private state : { [key: string]: string | undefined } = {
        equippedWeapon: undefined
    }

    constructor() {
        messaging.client.on(Message.playerSessionSync, payload => {
            print(payload);
            this.syncer.sync(payload);
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