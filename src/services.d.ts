interface ReplicatedStorage {
    Assets: Folder & {
        Viewmodels: Folder & {
            [key: string]: Model
        },

        // anyway to do this automatically??
        Weapons: Folder & {
            [key: string]: Model
        }
    }
}