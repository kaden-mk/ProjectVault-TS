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
            WM: {
                1: {
                    Part0: "Right Arm",
                    Part1: "Handle",
                    C0: new CFrame(-0.593, 0.527, -0.99)
                }
            }
        },
        
        AmmoData: {
            MagazineCapacity: 30,
            MaxMags: 5,
            AmmoType: ".45 ACP"
        },
        
        Recoil: {
            Hip: {
                CameraStiffness: 400,
                CameraDamping: 22,
                VerticalBase: 1.6,
                HorizontalBase: 0.05,
                VerticalRamp: 0.06,
                HorizontalRamp: 0.005,
                VerticalScale: 1.2,
                HorizontalScale: 0.25,
                HorizontalBias: 0.0,
                TiltBias: 0.01,        
                RollBias: -0.02,
                VerticalBias: 0.05,     
                RandomJitter: 0.01,    
                RandomTilt: 0.002,
                CameraKick: 3.6,
                CameraMultiplier: 2.5,
                RecoverySpeed: 24,
                PatternScale: 1.0,
                IntensityMultiplier: 1.0,
                ViewmodelKick: 5,    
                ViewmodelKickLimit: 6.5,
                ViewmodelTilt: 0.2,     
                ViewmodelMultiplier: 0.25,
                ContinuousFireMultiplier: 1.0,
                MicroShakeIntensity: 0.02, 
                ViewmodelKickSpeed: 55,    
            },
            Ads: {
                VerticalBase: 0.9,
                HorizontalBase: 0.015,
                HorizontalRamp: 0.001,
                VerticalRamp: 0.04,
                RecoverySpeed: 14,
                VerticalBias: 0.05,
                HorizontalBias: -0.005,
                RandomJitter: 0.005,   
                ViewmodelKick: 3,
                RandomTilt: 0.001,
                ViewmodelKickLimit: 1.5,
                ViewmodelTilt: 0.15,   
                ViewmodelMultiplier: 0.2,
                ContinuousFireMultiplier: 1.0
            }
        },

        RPM: 800,
        
        UnequipTime: 0.2,
        EquipTime: 0.2,
        ReloadTime: 2,
        ReloadEmptyTime: 2.3
    },
}