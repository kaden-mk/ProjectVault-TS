import { OnStart, Service } from "@flamework/core";
import { SafeTeleport } from "server/universal/modules/safe-teleport";
import { Message, messaging } from "shared/lobby/messaging";

@Service()
export class LobbyService implements OnStart {
    constructor() {}

    onStart() {
        messaging.server.on(Message.teleport, (player, data) => {
            // TODO: Add more security? + Add lobbies and stuff

            const id = 98069417029183;

            const teleportOptions = new Instance("TeleportOptions");
            teleportOptions.ShouldReserveServer = true;
            teleportOptions.SetTeleportData(data);

            SafeTeleport(id, [ player ]);
        })
    }
}