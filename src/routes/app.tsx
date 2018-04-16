// tslint:disable-next-line:no-unused-variable
import * as React from 'react';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import { DvaRouteComponentProps } from 'interfaces';
import { ReduxState } from 'interfaces/state';

interface AppProps {

}

interface StateProps {
}

type Props = Readonly<AppProps & StateProps & DvaRouteComponentProps>;

const App = ({ children, location }: Props) => {
    let { pathname } = location;
    pathname = pathname.startsWith('/') ? pathname : `/${pathname}`;

    return (
        <div>
            {children}
        </div>
    );
};

function mapStateToProps(state: ReduxState, ownProps: AppProps): StateProps {
    return {
    };
}

export default withRouter(connect(mapStateToProps)(App)) as any;