interface UIInterface extends PlayerGui {
    MainGui: ScreenGui & {
        Menu: Frame & {
            UIListLayout: UIListLayout,
            Play: TextButton,
            Inventory: TextButton,
            Title: TextLabel
        },
        Menus: Frame & {
            Heists: Frame & {
                Left: Frame & {
                    UICorner: UICorner,
                    UIGridLayout: UIGridLayout,
                    UIPadding: UIPadding,
                    Template: TextButton & {
                        UICorner: UICorner
                    }
                },
                Right: Frame & {
                    UICorner: UICorner,
                    PlayButton: TextButton,
                    ImageLabel: ImageLabel,
                    Heist: TextLabel,
                    Description: TextLabel
                },
                TextLabel: TextLabel
            }
        }
    }
}