interface Workspace {
    MainMenu: Sound,
    CameraSet: Part
}

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
        },

        Characters: Folder & {
            [key: string]: Model
        },

        Masks: Folder & {
            [key: string]: Folder & {
                Part: BasePart,
                Animation: Animation
            }
        },

        Bags: Folder & {
            [key: string]: BasePart
        }
    }
}