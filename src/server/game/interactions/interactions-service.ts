import { Components } from "@flamework/components";
import { Dependency, OnStart, Service } from "@flamework/core";
import { Interactions } from "server/game/interactions/interactions";
import { GetClassFromPlayer } from "server/game/players/player-class";
import { Message, messaging } from "shared/game/messaging";

@Service()
export class InteractionsService implements OnStart {
    onStart() {
        const components = Dependency<Components>();

        messaging.server.setCallback(Message.startInteraction, Message.startInteractionReturn, (player, interaction) => {
            const component = components.getComponent<Interactions>(interaction.interaction);
            if (component === undefined) return false;

            return component.onInteract(player);
        })

        messaging.server.on(Message.cancelInteraction, (player) => {
            const playerData = GetClassFromPlayer(player);

            const component = playerData?.state.activeInteraction;
            if (component === undefined) return;

            component.cancelInteraction(player);
        })
    }
}