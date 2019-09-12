import {
	Arg,
	Authorized,
	Ctx,
	FieldResolver,
	Mutation,
	Resolver,
	Root
} from "type-graphql";
import { FindOneOptions, getConnection } from "typeorm";
import { Channel } from "../../entity/Channel";
import { ChannelMember } from "../../entity/ChannelMember";
import { Team } from "../../entity/Team";
import { TeamMember } from "../../entity/TeamMember";
import { User } from "../../entity/User";
import { Context } from "../../types/Context";
import ComposeErrorMessage from "../shared/ComposeErrorMessage";
import { CreateChannelInput } from "./createChannel/CreateChannelInput";
import CreateChannelOutput from "./createChannel/CreateChannelOutput";

@Resolver(Channel)
export class CreateChannelResolver {
	@Authorized()
	@Mutation(() => [CreateChannelOutput])
	async createChannel(
		@Arg("data") { name, isPublic, teamId, members }: CreateChannelInput,
		@Ctx() ctx: Context
	): Promise<Array<typeof CreateChannelOutput>> {
		if (!name || !name.trim()) {
			return [
				ComposeErrorMessage("name", "Channel name should not be empty")
			];
		}
		const ownerPromise: Promise<
			TeamMember | undefined
		> = TeamMember.findOne({
			where: { teamId, isOwner: true, userId: ctx.req.session!.userId }
		});
		//find the logged in user
		const userPromise: Promise<User | undefined> = User.findOne({
			where: { id: ctx.req.session!.userId }
		});
		const [owner, user] = await Promise.all([ownerPromise, userPromise]);
		if (!owner) {
			return [
				ComposeErrorMessage(
					"name",
					"Only owner is allowed to create channel!"
				)
			];
		}
		//if user with given id does not exist or account is deleted
		if (!user) {
			return [ComposeErrorMessage("user", "User does not exist")];
		}

		const team = await Team.findOne({ where: { id: teamId } });
		if (!team) {
			return [ComposeErrorMessage("team", "Team does not exist")];
		}

		const channel = new Channel();
		channel.name = name;
		channel.public = isPublic;
		channel.team = team;
		await channel.save();
		if (!isPublic) {
			const channelMembers = members.filter(
				member => member !== ctx.req.session!.userId
			);
			channelMembers.push(ctx.req.session!.userId);
			await getConnection()
				.createQueryBuilder()
				.insert()
				.into(ChannelMember)
				.values(
					channelMembers.map(member => {
						return {
							channelId: channel.id,
							userId: parseInt(member, 10)
						};
					})
				)
				.execute();
		}
		return [channel];
	}

	@FieldResolver()
	async members(@Root() parent: Channel) {
		const findOptions: FindOneOptions = {
			relations: ["members"],
			where: { id: parent.id }
		};
		const channel: Channel | undefined = await Channel.findOne(findOptions);
		return channel!.members;
	}

	@FieldResolver()
	async messages(@Root() parent: Channel) {
		const findOptions: FindOneOptions = {
			relations: ["messages"],
			where: { id: parent.id }
		};
		const channel: Channel | undefined = await Channel.findOne(findOptions);
		return channel!.messages;
	}
}
