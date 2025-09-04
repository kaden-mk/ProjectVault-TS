import { SyncPayload } from "@rbxts/charm-sync";
import { MessageEmitter } from "@rbxts/tether";

import gameAtoms from "shared/game/data/game-atoms";
import atoms from "shared/game/data/player-atoms";

import weapons from "./data/weapons";

export const messaging = MessageEmitter.create<MessageData>();

// Maybe split??
export const enum Message {
  createWeapon,
  createWeaponReturn,
  equipWeapon,
  equipWeaponReturn,
  unequipWeapon,
  unequipWeaponReturn,
  fireWeapon,
  reloadWeapon,
  reloadWeaponReturn,
  requestSessionState,
  playerSessionSync,
  gameSessionSync,
  startInteraction,
  startInteractionReturn,
  cancelInteraction,
  playerReadyUp
}

export interface MessageData {
  /* weapons */
  [Message.createWeapon]: { readonly weaponName: keyof typeof weapons };
  [Message.createWeaponReturn]: boolean;
  [Message.equipWeapon]: { readonly weaponName: keyof typeof weapons };
  [Message.equipWeaponReturn]: boolean;
  [Message.fireWeapon]: { readonly startCFrame: CFrame };

  /* session */
  [Message.requestSessionState]: undefined,
  [Message.playerSessionSync]: SyncPayload<typeof atoms>
  [Message.gameSessionSync]: SyncPayload<typeof gameAtoms>

  /* interactions */
  [Message.startInteraction]: { readonly interaction: Instance };
  [Message.startInteractionReturn]: boolean;
  [Message.cancelInteraction]: undefined;

  /* player */
  [Message.playerReadyUp]: undefined;
}