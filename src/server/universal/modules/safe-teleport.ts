import { TeleportService } from "@rbxts/services";

const attemptLimit = 5;
const retryDelay = 1;
const floodDelay = 15;

export function SafeTeleport(placeId: number, players: Player[], options?: TeleportOptions) {
    let attemptIndex = 0;
    let pcallData = undefined;

    do {
        pcallData = pcall(() => {
            return TeleportService.TeleportAsync(placeId, players, options);
        })
        attemptIndex += 1;

        if (!pcallData[0]) {
            task.wait(retryDelay);
        }

    } while (!(pcallData[0] || attemptIndex < attemptLimit))

    if (!pcallData[0]) {
        warn(pcallData[1]);
    }

    return pcallData;
}

function HandleFailedTeleport(player: Player, teleportResult: Enum.TeleportResult, errorMessage: string, targetPlaceId: number, teleportOptions?: TeleportOptions) {
    if (teleportResult === Enum.TeleportResult.Flooded) {
        task.wait(floodDelay);
    } else if (teleportResult === Enum.TeleportResult.Failure) {
        task.wait(retryDelay);
    } else {
        error(("Invalid Teleport [%s]: %s").format(teleportResult.Name, errorMessage));
    }

    SafeTeleport(targetPlaceId, [ player ], teleportOptions);
}

TeleportService.TeleportInitFailed.Connect(HandleFailedTeleport);