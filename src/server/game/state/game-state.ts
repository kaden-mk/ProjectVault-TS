import { atom } from "@rbxts/charm";
import gameAtoms from "shared/game/data/game-atoms";

export const gameState = {
    take: atom(0),
    playersReady: atom(0),
    objective: atom(""),
    ended: atom(false)
} satisfies typeof gameAtoms;