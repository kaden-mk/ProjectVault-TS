export default {
    "Instant-Loot": {
        Type: "Instant", // note to self: turn this into an enum
        Mask: true,
    },
    "Loot": {
        Type: "Wait",
        WaitTime: 0.5,
        Mask: true,
    },
    "Door": {
        Type: "Instant",
        Mask: false,
    },
    "Mask": {
        Type: "Wait",
        Mask: false,
        Sound: "Objective",

        WaitTime: 1,
    }
}