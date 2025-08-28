export default {
    "Instant-Loot": {
        Type: "Instant", // note to self: turn this into an enum
        
        Text: (object: Instance) => `to take the ${object.Name}`
    },
    "Loot": {
        Type: "Wait",
        WaitTime: 0.5,

        Text: (object: Instance) => `to bag the ${object.Name}`
    }
}