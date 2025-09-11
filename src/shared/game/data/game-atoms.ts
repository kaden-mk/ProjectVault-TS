import { atom } from "@rbxts/charm"

export default {
    take: atom(0),
    playersReady: atom(0),
    objective: atom(""),
    ended: atom(false)
}