import { OnStart, Service } from "@flamework/core";
import { GetPlayer } from "server/game/players/player-class";
import { Message, messaging } from "shared/game/messaging";
import { GetInteractionFromId } from "./interactions";

@Service()
export class InteractionsService implements OnStart {
    constructor() {};

    onStart() {
        messaging.server.setCallback(Message.canCreateInteraction, Message.canCreateInteractionReturn, (player, data) => {
            return GetInteractionFromId(data.id) !== undefined;
        });

        messaging.server.setCallback(Message.startInteraction, Message.startInteractionReturn, (player, data) => {
            const component = GetInteractionFromId(data.interaction);
            if (component === undefined) return false;

            return component.onInteract(player);
        });

        messaging.server.on(Message.cancelInteraction, (player) => {
            const playerData = GetPlayer(player);

            if (!playerData || !playerData.state.activeInteraction) return;

            const component = GetInteractionFromId(playerData.state.activeInteraction);
            if (component === undefined) return;

            component.cancelInteraction(player);
        });
    }
}