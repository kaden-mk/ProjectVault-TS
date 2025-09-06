interface GameGui extends ScreenGui {
    Interact: Frame & {
        Background: Frame,
        Progress: Frame,
        Text: TextLabel
    },
    TopLeft: Frame & {
        TextLabel: TextLabel
    },
    BlackScreen: Frame,
    Crosshair: ImageLabel
}

interface StartingGui extends ScreenGui {
    StartingFrame: Frame & {
        TextButton: TextButton,
        TextLabel: TextLabel
    }
}