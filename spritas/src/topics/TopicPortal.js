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
        var loaded = (this.state.ever) ?
        <div className="TopicPortal-loaded" title="All Posts Shown">All Posts Shown</div>
        : null;
        var load = (this.props.more && this.props.posts.length > 0) ?
        <div className="TopicPortal-load" onClick={this.loadPosts} title="Show More Posts">Show More Posts</div> 
        : loaded;
        if (this.props.loadingMore) load = (
            <div className='TopicPortal-load' title="Loading More Posts">
                <div className='LoadingCover LoadingCover-anim'></div>
                Loading More Posts...
            </div>
        )
        if (this.props.posts.length <= 0) load = <div className="TopicPortal-loaded" title="No Posts">No Posts</div>;

        return (
            <div className="TopicPortal">
                <div className='TopicPortal-posts'>
                    {this.props.posts}
                </div>
                {load}
            </div>
        );
    }
}
