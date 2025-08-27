import { MessageEmitter } from "@rbxts/tether";
import weapons from "./data/weapons";

export const messaging = MessageEmitter.create<MessageData>();

export const enum Message {
  createWeapon,
  createWeaponReturn
}

export interface MessageData {
  [Message.createWeapon]: { readonly weaponName: keyof typeof weapons };
  [Message.createWeaponReturn]: boolean;
}