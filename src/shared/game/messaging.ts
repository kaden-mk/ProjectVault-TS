import { MessageEmitter } from "@rbxts/tether";
import { SyncPayload } from "@rbxts/charm-sync";

import weapons from "./data/weapons";
import atoms from "shared/game/data/atoms";

export const messaging = MessageEmitter.create<MessageData>();

// Maybe split??
export const enum Message {
  createWeapon,
  createWeaponReturn,
  requestSessionState,
  playerSessionSync,
  startInteraction,
  startInteractionReturn,
  cancelInteraction
}

export interface MessageData {
  /* weapons */
  [Message.createWeapon]: { readonly weaponName: keyof typeof weapons };
  [Message.createWeaponReturn]: boolean;

  /* session */
  [Message.requestSessionState]: undefined,
  [Message.playerSessionSync]: SyncPayload<typeof atoms>

  /* interactions */
  [Message.startInteraction]: { readonly interaction: Instance };
  [Message.startInteractionReturn]: boolean;
  [Message.cancelInteraction]: undefined;
}