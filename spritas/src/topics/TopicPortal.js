import React from 'react';
import './TopicPortal.css';

export default class TopicPortal extends React.Component {
    constructor(props) {
        super(props);
        this.loadPosts = this.loadPosts.bind(this);
        this.state = {ever: false};
    }

    loadPosts() {
        this.props.load();

        if (!this.state.ever) this.setState({ever: true});
    }

    render() {
        const loaded = (this.state.ever) ?
        <div className="TopicPortal-loaded" title="All Posts Loaded">All Posts Loaded</div> : null;
        const load = (this.props.more) ?
        <div className="TopicPortal-load" onClick={this.loadPosts} title="Load More Posts">Load More Posts</div> 
        : loaded;

        const top = (this.props.top) ? "TopicPortal-top" : null;

        return (
            <div className="TopicPortal" id={top}>
                <div className="TopicPortal-controls">
                    {this.props.controls}
                </div>
                {this.props.topics}
                {this.props.posts}
                {load}
            </div>
        );
    }
}
