import { Arg, Resolver, Root, Subscription } from "type-graphql";
import { Message } from "../../entity/Message";
import { CHANNEL_MESSAGE } from "./constants";

@Resolver()
export class NewMessageResolver {
	@Subscription({
		topics: CHANNEL_MESSAGE,
		filter: ({ payload, args }) => {
			return args.channelId === payload.channelId;
		}
	})
	newMessage(
		@Root() MessagePayload: Message,
		@Arg("channelId") channelId: string
	): Message {
		console.log(channelId);
		console.log(MessagePayload);
		return MessagePayload;
	}
}
