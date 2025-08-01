import { MessageEmitter } from "@rbxts/tether";
import type { u8 } from "@rbxts/serio";

export const messaging = MessageEmitter.create<MessageData>();

export const enum Message {
  Test,
}

export interface MessageData {
  [Message.Test]: {
    readonly foo: string;
    readonly n: u8;
  };
}