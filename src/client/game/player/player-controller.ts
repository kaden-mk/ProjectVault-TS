import { Players } from "@rbxts/services";
import { messaging, Message } from "shared/game/messaging";
import { Controller, OnStart } from "@flamework/core"

import CharmSync from "@rbxts/charm-sync";
import atoms from "shared/game/data/atoms";

import { Weapon } from "../weapons/weapon-type";

@Controller()
export class PlayerController implements OnStart {
    public player = Players.LocalPlayer;
    public replicatedPlayerState = table.clone(atoms); 

    public weapons: { [key: string]: Weapon } = {};

    private syncer = CharmSync.client({
        atoms: this.replicatedPlayerState
    });

    private state : { [key: string]: string | undefined } = {
        equippedWeapon: undefined
    }

    onStart() {
        messaging.client.on(Message.playerSessionSync, payload => {
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