import React, {PureComponent} from 'react';
import {Card, Icon, Image} from 'semantic-ui-react';
import {NavLink} from "react-router-dom";

class EpisodeItem extends PureComponent {
    constructor() {
        super(...arguments);

        let defaultImage = '/web/img/default-backdrop.jpg';
        let fromMedia = this.props.media.local_backdrop || this.props.media.local_still || this.props.media.local_screenshot;
        this.img = fromMedia ? '/images/' + fromMedia : defaultImage;

    }

    getUrl(mediaItem) {
        return `/libraries/${mediaItem.library_uid}/${mediaItem.type}s/${mediaItem.uid}`;
    }

    render() {
        return <Card className="media-item" as={NavLink} to={this.getUrl(this.props.media)}>
            <div className="media-item-image-container">
                <Image src={this.img}/>
                <div className="media-item-hover">
                    <div className="media-item-play-icon"><Icon name="play"/></div>
                </div>
            </div>
            <Card.Content>
                <Card.Header>{this.props.media.name}</Card.Header>
                <Card.Meta>
                    <span>Episode {this.props.media.episode_number}</span>
                </Card.Meta>
            </Card.Content>

        </Card>
    }
}

export default EpisodeItem;