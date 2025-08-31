import { ReplicatedStorage } from "@rbxts/services"

export default {
    M4A1: {
        Model: ReplicatedStorage.Assets.Weapons.M4A1,

        Automatic: true, // for now (maybe add firestates man idk)

        ADSStartingTransition: new CFrame(0, 0, -1).mul(CFrame.Angles(0, 0, -0.24434609527920614)),
        ADSStopStartingTransition: new CFrame(0, 0, -1),

        Rig: {
            VM: {
                1: {
                    Part0: "MainHolder",
                    Part1: "Handle",
                    C0: new CFrame(0, -0.398, -0.946)
                },

                2: {
                    Part0: "MainHolder",
                    Part1: "Ammo/Base",
                    C0: new CFrame(0.003, -1.094, -1.574).mul(CFrame.Angles(0, math.rad(-90), 0))
                },

                3: {
                    Part0: "MainHolder",
                    Part1: "BaseA",
                    C0: new CFrame(0.003, -1.094, 2.356).mul(CFrame.Angles(0, math.rad(-90), 0))
                }
            },
        },
        
        AmmoData: {
            MagazineCapacity: 30,
            MaxMags: 5,
            AmmoType: ".45 ACP"
        },
        
        Recoil: {
            VerticalBase: 0.6,
            HorizontalBase: 0.25,
            RandomJitter: 0.3,
            RecoverySpeed: 25,

            VerticalPower: 3,
            HorizontalPower: 1.5,

            ViewmodelKick: 10,
            ViewmodelTilt: 10,
            ViewmodelMultiplier: 2,

            MicroShakeIntensity: 1,
            ContinousFireMultiplier: 1.8,

            CameraDamping: 20,
            CameraStiffness: 350
        },

        RPM: 800,
        
        UnequipTime: 0.2,
        EquipTime: 0.2,
        ReloadTime: 1.4,
        ReloadEmptyTime: 1.65
    },
}