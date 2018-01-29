import React from 'react';
import MediaList from '../components/MediaList/MediaList';
import {Dimmer, Loader} from 'semantic-ui-react'
import {connect} from "react-redux";
import {withRouter} from 'react-router-dom'


class MediaListContainer extends React.Component {
    constructor() {
        super(...arguments);

        this.state = {
            loading: true,
            error: null,
            data: null
        }
    }

    componentDidMount() {
        this.fetch(this.props['library-type'], this.props['library-uid']);
    }

    componentWillReceiveProps(newProps) {
        if(newProps['library-type'] !== this.props['library-type'] ||
           newProps['library-uid'] !== this.props['library-uid']) {
            this.fetch(newProps['library-type'], newProps['library-uid']);
        }
    }

    async fetch (type, uid) {
        try {

            let query = '';

            if(uid) query = '?library_uid=' + uid;

            const result = await fetch(`/api/${type}/${query}`);
            const movies = await result.json();
            this.setState({loading:false, data: movies});
        } catch (e) {
            this.setState({loading:false, error: e.message});
        }
    }

    render() {
        if(this.state.loading) return <Dimmer active><Loader /></Dimmer>;
        if(this.state.error) return <div>{this.state.error}..</div>;

        return <MediaList medias={this.state.data} />
    }
}

export default withRouter(connect(
    null,
    null
)(MediaListContainer))
