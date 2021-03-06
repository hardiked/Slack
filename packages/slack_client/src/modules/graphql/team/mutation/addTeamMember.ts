import gql from "graphql-tag";

export const ADD_TEAM_MEMBER_MUTATION = gql`
	mutation AddTeamMemberMutatio($teamId: String!, $email: String!) {
		addTeamMember(teamId: $teamId, email: $email) {
			path
			message
		}
	}
`;
