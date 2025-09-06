import { OnStart, Service } from "@flamework/core";
import { Weapon } from "server/game/weapons/weapons-class";
import { Message, messaging } from "shared/game/messaging";
import { GetRegisteredPlayer } from "../players/player-service";

@Service()
export class WeaponService implements OnStart {
    private weapons: Record<string, Record<string, Weapon>> = {};

    onStart() {
        messaging.server.setCallback(Message.createWeapon, Message.createWeaponReturn, (player, data) => {
            if (!this.weapons[player.Name]) this.weapons[player.Name] = {};
            if (this.weapons[player.Name][data.weaponName]) return false;

            const weaponName = data.weaponName;
            const playerClass = GetRegisteredPlayer(player);
            
            if (playerClass === undefined) return false;
            if (playerClass.inventory.weapons[weaponName] === undefined) return false;

            const weaponClass = new Weapon(weaponName, player);

            if (weaponClass === undefined) return false;

            this.weapons[player.Name][data.weaponName] = weaponClass;
            print(`Created weapon ${weaponName} for player ${player.Name}`);

            return true;
        });

        messaging.server.setCallback(Message.equipWeapon, Message.equipWeaponReturn, (player, data) => {
            if (!this.weapons[player.Name]) return false;
            if (!this.weapons[player.Name][data.weaponName]) return false;

            const weapon = this.weapons[player.Name][data.weaponName];

            const playerClass = GetRegisteredPlayer(player);
            if (!playerClass) return false;
            if (playerClass.GetEquippedWeapon() === data.weaponName) return false;

            return weapon.Equip();
        });

        messaging.server.on(Message.fireWeapon, (player, data) => {
            if (!this.weapons[player.Name]) return false;
            
            const playerClass = GetRegisteredPlayer(player);
            if (!playerClass) return false;
            if (playerClass.GetEquippedWeapon() === undefined) return false;

            const weapon = this.weapons[player.Name][playerClass.GetEquippedWeapon() as string];

            if (!weapon) return false;

            return weapon.Fire(data.startCFrame);
        })
    }
}