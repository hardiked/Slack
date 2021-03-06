import React from "react";
import { useQuery } from "react-apollo";
import { Redirect, Route, RouteComponentProps } from "react-router-dom";
import {
	MeQueryQueryResult,
	MeQueryQueryVariables
} from "src/generated/graphqlTypes";
import { ME_QUERY } from "src/modules/graphql/user/query/meQuery";
// import { meQuery } from "../graphql/user/query/me";

const AuthRoute: React.FC<RouteComponentProps<{}> & any> = props => {
	const { loading, data } = useQuery<
		MeQueryQueryResult,
		MeQueryQueryVariables
	>(ME_QUERY);
	function renderRoute(routeProps: RouteComponentProps) {
		if (loading) {
			return null;
		}
		if (data && (!(data as any).me || !(data as any).me.email)) {
			// me is not there so user is not logged in
			return (
				<Redirect
					to={{
						pathname: "/login",
						state: {
							next: routeProps.location.pathname
						}
					}}
				/>
			);
		}
		const Component = props.component;
		return <Component {...props} {...routeProps} />;
	}
	const { data: _, component: __, ...rest } = props;
	return <Route {...rest} render={renderRoute} />;
};

export default AuthRoute;
