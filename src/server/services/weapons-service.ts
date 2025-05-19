import { Service, OnStart } from "@flamework/core"
import { Weapon } from "server/classes/weapons-class"
import { PlayerService } from "./player-service";
import { Functions } from "server/network"

@Service()
export class WeaponService implements OnStart {
    constructor(private playerService: PlayerService) {};

    private weapons = new Map<string, Weapon>();

    onStart() {
        Functions.createWeapon.setCallback((player, weaponName) => {
            if (this.weapons.has(weaponName)) return false;

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