export type Config = {
    CameraStiffness: number,
    CameraDamping: number,

    VerticalStrength?: number,
    HorizontalStrength?: number,

    HorizontalBias?: number,
    VerticalRamp?: number,
    HorizontalRamp?: number,

    RandomJitter?: number,
    RandomTilt?: number,

    RecoverySpeed: number,

    PatternScale?: number,
    IntensityMultiplier?: number,

    ViewmodelKick: number,
    ViewmodelTilt: number,
    ViewmodelMultiplier?: number,

    VerticalPower?: number,
    HorizontalPower?: number,

    ContinuousFireMultiplier?: number,
    MicroShakeIntensity?: number,

    RPM?: number
}

export type RecoilProfileType = {
    CameraStiffness: number,
    CameraDamping: number,

    VerticalStrength: number,
    HorizontalStrength: number,

    HorizontalBias: number,
    VerticalRamp: number,
    HorizontalRamp: number,

    RandomJitter: number,
    RandomTilt: number,

    RecoverySpeed: number,

    PatternScale: number,
    IntensityMultiplier: number,

    ViewmodelKick: number,
    ViewmodelTilt: number,
    ViewmodelMultiplier: number,

    VerticalPower: number,
    HorizontalPower: number,

    ContinuousFireMultiplier: number,
    MicroShakeIntensity: number,

    RPM: number,

    ShotIndex: number,
}

export namespace RecoilProfile {
    export function create(config: Config): RecoilProfileType {
        let profile: RecoilProfileType = {
            CameraStiffness: config.CameraStiffness ?? 200,
            CameraDamping: config.CameraDamping ?? 25,

            VerticalStrength: config.VerticalStrength ?? 1.0,
            HorizontalStrength: config.HorizontalStrength ?? 0.3,

            HorizontalBias: config.HorizontalBias ?? 1.0,
            VerticalRamp: config.VerticalRamp ?? 0.0,
            HorizontalRamp: config.HorizontalRamp ?? 0.0,

            RandomJitter: config.RandomJitter ?? 0.0,
            RandomTilt: config.RandomTilt ?? 0.0,

            RecoverySpeed: config.RecoverySpeed ?? 8,

            PatternScale: config.PatternScale ?? 1.0,
            IntensityMultiplier: config.IntensityMultiplier ?? 1.0,

            ViewmodelKick: config.ViewmodelKick ?? 1.0,
            ViewmodelTilt: config.ViewmodelTilt ?? 0.0,
            ViewmodelMultiplier: config.ViewmodelMultiplier ?? 1.0,

            VerticalPower: config.VerticalPower ?? 6,
            HorizontalPower: config.HorizontalPower ?? 3,

            ContinuousFireMultiplier: config.ContinuousFireMultiplier ?? 1.0,
            MicroShakeIntensity: config.MicroShakeIntensity ?? 1.5,

            RPM: config.RPM ?? 600,

            ShotIndex: 0,
        };

        return profile;
    }

    export function reset(profile: RecoilProfileType) {
        profile.ShotIndex = 0;
    }

    export function evaluteShot(profile: RecoilProfileType) {
        profile.ShotIndex += 1;

        let v = (profile.VerticalStrength + (profile.ShotIndex * profile.VerticalRamp));
        let h = (profile.HorizontalStrength + (profile.ShotIndex * profile.HorizontalRamp));

        v *= profile.PatternScale * profile.IntensityMultiplier;
        h *= profile.PatternScale * profile.IntensityMultiplier * profile.HorizontalBias;

        if (profile.RandomJitter > 0) {
            v += (math.random() - 0.5) * 2 * profile.RandomJitter;
            h += (math.random() - 0.5) * 2 * profile.RandomJitter;
        }

        let roll = 0;
        if (profile.RandomTilt)
            roll = (math.random() - 0.5) * 2 * profile.RandomJitter;

        return { h, v, roll }
    }
}