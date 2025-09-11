import { Controller, OnStart } from "@flamework/core";
import { Players, Workspace } from "@rbxts/services";
import { LootValue } from "shared/game/data/loot";
import { Message, messaging } from "shared/game/messaging";
import { Input } from "../input/input-class";
import { UITil } from "../modules/ui-til";

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

    public state: { equippedWeapon: string | undefined, currentInteraction: unknown | undefined, running: boolean } = {
        equippedWeapon: undefined,
        currentInteraction: undefined,
        running: false
    }

    private syncer = CharmSync.client({
        atoms: this.replicatedPlayerState
    });

    private gameSyncer = CharmSync.client({
        atoms: this.replicatedGameState
    });

    private inputController = new Input();

    private input() {
        this.inputController.Bind("ThrowBag", Enum.KeyCode.G, false, () => {
            let throwDirection = Workspace.CurrentCamera!.CFrame.LookVector;
            throwDirection = new Vector3(throwDirection.X, throwDirection.Y + 0.8, throwDirection.Z).Unit; 

            messaging.server.emit(Message.throwBag, { throwDirection: throwDirection });
        });
    }

    onStart() {
        messaging.client.on(Message.playerSessionSync, payload => {
            this.syncer.sync(payload);

            // to improve?
            if (payload.data.masked)
                this.onMask.Fire();

            if (payload.data.bagged)
                UITil.UpdateHoldingText(payload.data.bagged as LootValue);
        });

        messaging.client.on(Message.gameSessionSync, payload => {
            this.gameSyncer.sync(payload);
            this.gameStateUpdated.Fire();

            if (payload.data.objective)
                UITil.UpdateObjectiveText(payload.data.objective);

            if (payload.data.ended)
                UITil.OnEnd();
        });

        messaging.server.emit(Message.requestSessionState);

        this.input();
        this.inputController.Init();
    }

    EquipWeapon(weaponName?: string) {
        this.state.equippedWeapon = weaponName; 
    }

    DoesPlayerHaveAWeaponEquipped() {
        return this.state.equippedWeapon;
    }
}