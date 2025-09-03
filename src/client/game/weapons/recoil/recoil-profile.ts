export type Config = {
    CameraStiffness?: number
    CameraDamping?: number

    VerticalBase?: number
    HorizontalBase?: number
    VerticalRamp?: number
    HorizontalRamp?: number

    VerticalScale?: number
    HorizontalScale?: number

    VerticalPower?: number
    HorizontalPower?: number

    HorizontalBias?: number
    TiltBias?: number
    RollBias?: number
    VerticalBias?: number

    RandomJitter?: number
    RandomTilt?: number

    RecoverySpeed?: number

    PatternScale?: number
    IntensityMultiplier?: number

    ViewmodelKick?: number
    ViewmodelKickSpeed?: number
    ViewmodelKickLimit?: number
    ViewmodelTilt?: number
    ViewmodelMultiplier?: number

    CameraKick?: number
    CameraMultiplier?: number

    ContinuousFireMultiplier?: number
    MicroShakeIntensity?: number
}

export type RecoilProfileType = {
    CameraStiffness: number
    CameraDamping: number

    VerticalBase: number
    HorizontalBase: number
    VerticalRamp: number
    HorizontalRamp: number

    VerticalScale: number
    HorizontalScale: number

    VerticalPower: number
    HorizontalPower: number

    HorizontalBias: number
    TiltBias: number
    RollBias: number
    VerticalBias: number

    RandomJitter: number
    RandomTilt: number

    RecoverySpeed: number

    PatternScale: number
    IntensityMultiplier: number

    ViewmodelKick: number
    ViewmodelKickSpeed: number
    ViewmodelKickLimit: number
    ViewmodelTilt: number
    ViewmodelMultiplier: number

    CameraKick: number
    CameraMultiplier: number

    ContinuousFireMultiplier: number
    MicroShakeIntensity: number

    RPM: number

    ShotIndex: number
}

const DEFAULT_PROFILE: RecoilProfileType = {
    CameraStiffness: 200,
    CameraDamping: 25,

    VerticalBase: 1.0,
    HorizontalBase: 0.3,
    VerticalRamp: 0.0,
    HorizontalRamp: 0.0,

    VerticalScale: 1.0,
    HorizontalScale: 1.0,

    VerticalPower: 1.0,
    HorizontalPower: 1.0,

    HorizontalBias: 0.0,
    TiltBias: 0.0,
    RollBias: 0.0,
    VerticalBias: 0.0,

    RandomJitter: 0.0,
    RandomTilt: 0.0,

    RecoverySpeed: 8,

    PatternScale: 1.0,
    IntensityMultiplier: 1.0,

    ViewmodelKick: 1.0,
    ViewmodelKickSpeed: 6.0,
    ViewmodelKickLimit: 3,
    ViewmodelTilt: 0.0,
    ViewmodelMultiplier: 1.0,

    CameraKick: 0.5,
    CameraMultiplier: 2,

    ContinuousFireMultiplier: 1.0,
    MicroShakeIntensity: 1.5,

    RPM: 600,

    ShotIndex: 0,
}

export namespace RecoilProfile {
    export function create(config: Config): RecoilProfileType {
        return { ...DEFAULT_PROFILE, ...config, ShotIndex: 0 }
    }

    export function reset(profile: RecoilProfileType) {
        profile.ShotIndex = 0
    }

    export function evaluateShot(profile: RecoilProfileType) {
        profile.ShotIndex += 1

        let v = profile.VerticalBase + profile.ShotIndex * profile.VerticalRamp
        let h = profile.HorizontalBase + profile.ShotIndex * profile.HorizontalRamp

        v *= profile.VerticalScale * profile.PatternScale * profile.IntensityMultiplier
        h *= profile.HorizontalScale * profile.PatternScale * profile.IntensityMultiplier

        h += profile.HorizontalBias

        if (profile.RandomJitter > 0) {
            v += (math.random() - 0.5) * 2 * profile.RandomJitter
            h += (math.random() - 0.5) * 2 * profile.RandomJitter
        }

        let roll = profile.TiltBias
        if (profile.RandomTilt > 0) {
            roll += (math.random() - 0.5) * 2 * profile.RandomTilt
        }

        return { h, v, roll }
    }

    export function withOverrides(base: RecoilProfileType, overrides: Config): RecoilProfileType {
        return create({ ...base, ...overrides })
    }
}