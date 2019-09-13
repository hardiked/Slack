import findIndex from "lodash/findIndex";
import * as React from "react";
import { useMutation } from "react-apollo";
import {
	CreateMessageMutationMutation,
	CreateMessageMutationMutationVariables
} from "../../generated/graphqlTypes";
import { CREATE_MESSAGE_MUTATION } from "../graphql/message/mutation/createMessageMutation";
import Header from "./content/Header";
import MessageContainer from "./content/MessageContainer";
import SendMessage from "./content/SendMessage";
import Sidebar from "./sidebar/Sidebar";
import Container from "./styled-components/Container";

export interface Props {
	currentChannelId: string;
	team: any;
	allTeams: any;
	username: string;
	teamIdx: number;
}

// @Todo: add type safety on team by making owner nullable on banckend and handle the case when no team
const ViewTeam: React.FC<Props> = ({
	currentChannelId,
	team,
	allTeams,
	username,
	teamIdx
}) => {
	const [createMessage] = useMutation<
		CreateMessageMutationMutation,
		CreateMessageMutationMutationVariables
	>(CREATE_MESSAGE_MUTATION);
	const channelIdx = currentChannelId
		? findIndex(team.channels, ["id", currentChannelId])
		: 0;
	const channel =
		channelIdx === -1 ? team.channels[0] : team.channels[channelIdx];

	async function sendMessageSubmit(text: string) {
		await createMessage({
			variables: { text, channelId: channel.id }
		});
	}

	return (
		<Container>
			<Sidebar
				teams={allTeams}
				team={team}
				teamIdx={teamIdx}
				username={username}
			/>
			{channel && <Header channelName={channel.name} />}
			{channel && <MessageContainer channelId={channel.id} />}
			{channel && (
				<SendMessage
					submit={sendMessageSubmit}
					channelId={channel.id}
					channelName={channel.name}
				/>
			)}
		</Container>
	);
};

export default ViewTeam;
