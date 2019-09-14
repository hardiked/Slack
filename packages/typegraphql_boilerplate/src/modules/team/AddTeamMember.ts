import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { TeamMember } from "../../entity/TeamMember";
import { User } from "../../entity/User";
import { Context } from "../../types/Context";
import ComposeErrorMessage from "../shared/ComposeErrorMessage";
import ErrorType from "../shared/ErrorType";

@Resolver()
export class AddTeamMemberResolver {
	@Mutation(() => ErrorType, { nullable: true })
	async addTeamMember(
		@Arg("email") email: string,
		@Arg("teamId") teamId: string,
		@Ctx() ctx: Context
	): Promise<ErrorType | null> {
		if (!email || !email.trim()) {
			return ComposeErrorMessage("name", "Email should not be empty");
		}
		//find the logged in user
		if (!ctx.req.session || !ctx.req.session.userId) {
			return ComposeErrorMessage("user", "Your session had expired!");
		}
		const owner = await TeamMember.findOne({
			where: { isOwner: true, userId: ctx.req.session.userId, teamId }
		});
		if (!owner) {
			return ComposeErrorMessage(
				"name",
				"Only owner allowed to add team member"
			);
		}
		const user: User | undefined = await User.findOne({ where: { email } });
		if (!user) {
			return ComposeErrorMessage("name", "User does not exist");
		}
		await TeamMember.create({
			teamId,
			userId: user.id
		}).save();
		return null;
	}
}
