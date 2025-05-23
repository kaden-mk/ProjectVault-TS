import { Networking } from "@flamework/networking";
import weapons from "./data/weapons";

interface ClientToServerEvents {}

interface ServerToClientEvents {}

interface ClientToServerFunctions {
    createWeapon: (weaponName: keyof typeof weapons) => boolean;
    equipWeapon: (weaponName: keyof typeof weapons) => boolean;
    unequipWeapon: () => boolean;
    reloadWeapon: () => boolean;
    fireWeapon: () => boolean;
}

interface ServerToClientFunctions {}

export const GlobalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();
export const GlobalFunctions = Networking.createFunction<ClientToServerFunctions, ServerToClientFunctions>();
