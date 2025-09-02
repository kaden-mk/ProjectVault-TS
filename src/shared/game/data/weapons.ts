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
                CameraStiffness: 350,
                CameraDamping: 25,

                VerticalBase: 0.9,      
                HorizontalBase: 0.2,     
                VerticalRamp: 0.05,      
                HorizontalRamp: 0.02,   

                VerticalScale: 1.0,
                HorizontalScale: 1.0,

                HorizontalBias: 0.0,     
                TiltBias: 0.05,        
                RollBias: -0.08,        
                VerticalBias: 0.08,     

                RandomJitter: 0.12,     
                RandomTilt: 0.05,       

                CameraKick: 3.2,
                CameraMultiplier: 2.5,

                RecoverySpeed: 20,    

                PatternScale: 1.0,
                IntensityMultiplier: 1.0,

                ViewmodelKick: 8,
                ViewmodelTilt: 6,
                ViewmodelMultiplier: 1.2,

                ContinuousFireMultiplier: 1.4,
                MicroShakeIntensity: 0.5,
            },
            Ads: {
                VerticalBase: 0.6,       
                HorizontalBase: 0.12,   
                VerticalRamp: 0.03,
                HorizontalRamp: 0.01,

                RecoverySpeed: 15,     

                //RollBias: -0.04,        
                VerticalBias: 0.04,      

                RandomJitter: 0.06,      
                RandomTilt: 0.02,        

                ViewmodelKick: 3,
                ViewmodelTilt: 4,
                ViewmodelMultiplier: 1, // this does nothing?

                ContinuousFireMultiplier: 1.2,
            }
        },

        RPM: 800,
        
        UnequipTime: 0.2,
        EquipTime: 0.2,
        ReloadTime: 2,
        ReloadEmptyTime: 2.3
    },
}