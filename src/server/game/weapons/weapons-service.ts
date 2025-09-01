import { OnStart, Service } from "@flamework/core";
import { Weapon } from "server/game/weapons/weapons-class";
import { Message, messaging } from "shared/game/messaging";
import { PlayerService } from "../players/player-service";

@Service()
export class WeaponService implements OnStart {
    constructor(private playerService: PlayerService) {};

    private weapons = new Map<string, Weapon>();

    onStart() {
        messaging.server.setCallback(Message.createWeapon, Message.createWeaponReturn, (player, data) => {
            if (this.weapons.has(data.weaponName)) return false;

            const weaponName = data.weaponName;
            const playerClass = this.playerService.GetPlayer(player);
            
            if (playerClass === undefined) return false;
            if (playerClass.inventory.weapons[weaponName] === undefined) return false;

            const weaponClass = new Weapon(weaponName, player, this.playerService);

            if (weaponClass === undefined) return false;

            this.weapons.set(weaponName, weaponClass);
            print(`Created weapon ${weaponName} for player ${player.Name}`);

            return true;
        });
    }
}