import { ReplicatedStorage } from "@rbxts/services"

export default {
    C8A3: {
        Model: ReplicatedStorage.Assets.Weapons.C8A3,

        Automatic: true, // for now (maybe add firestates man idk)

        HandleRig: {
            VM: {
                To: "RightArm",
                Tagged: true,
                
                Position: new Vector3(0.374, 1.891, 1.55),
                Rotation: new Vector3(90, 90, 0)
            },

            TP: {
                To: "Right Arm",

                Position: new Vector3(-0.936, 0.11, -2.004),
                Rotation: new Vector3(0, 0, 0)
            }
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
            RecoverySpeed: 10,

            VerticalPower: 3,
            HorizontalPower: 1.5,

            ViewmodelKick: 15,
            ViewmodelTilt: 10,
            ViewmodelMultiplier: 4,

            MicroShakeIntensity: 1,
            ContinousFireMultiplier: 1.8,

            CameraDamping: 20,
            CameraStiffness: 350
        },

        RPM: 600,
        
        UnequipTime: 0.2,
        EquipTime: 0.2,
        ReloadTime: 1.4,
        ReloadEmptyTime: 1.65
    },

    M1911: {
        Model: ReplicatedStorage.Assets.Weapons.M1911,

        Automatic: false,

        HandleRig: {
            VM: {
                To: "RightArm",
                Tagged: true,

                Position: new Vector3(0.138, 2.431, 1.436),
                Rotation: new Vector3(0, 0, -90)
            },

            TP: {
                To: "Right Arm",

                Position: new Vector3 (-1.264, 0.097, -1.658),
                Rotation: new Vector3(0, -90, 0)
            }
        },
        
        AmmoData: {
            MagazineCapacity: 7,
            MaxMags: 5,
            AmmoType: ".45 ACP" 
        },

                Recoil: {
            VerticalBase: 0.6,
            HorizontalBase: 0.25,
            RandomJitter: 0.3,
            RecoverySpeed: 10,

            VerticalPower: 3,
            HorizontalPower: 1.5,

            ViewmodelKick: 15,
            ViewmodelTilt: 10,
            ViewmodelMultiplier: 4,

            MicroShakeIntensity: 1,
            ContinousFireMultiplier: 1.8,

            CameraDamping: 20,
            CameraStiffness: 350
        },
        
        RPM: 350,
        
        UnequipTime: 0.2,
        EquipTime: 0.2,
        ReloadTime: 1.4,
        ReloadEmptyTime: 1.65,
    }
}