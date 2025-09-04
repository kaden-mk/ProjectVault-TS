interface ServerStorage {
    Assets: Folder & {
        Maps: Folder & {
            [key: string]: Model
        }
    }
}