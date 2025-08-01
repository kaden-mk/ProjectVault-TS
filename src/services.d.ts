interface ReplicatedStorage {
    Assets: Folder & {
        Viewmodels: Folder & {
            [key: string]: Model  & {
                AnimationController: AnimationController & {
                    Animator: Animator
                }
            }
        },

        Weapons: Folder & {
            [key: string]: Model
        }
    }
}