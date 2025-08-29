import { MessageEmitter } from "@rbxts/tether";

export const messaging = MessageEmitter.create<MessageData>();

// Maybe split??
export const enum Message {
    teleport
}

export interface MessageData {
    [Message.teleport]: { heist: string, difficulty: string }
}