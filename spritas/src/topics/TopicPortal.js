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
        var load = "";
        var loadClass = "TopicPortal-loaded";
        var loadClick = false;
        var cover = "";
        if (this.state.ever) {
            load = "All Posts Shown";
            loadClass = "TopicPortal-loaded";
        }
        if (this.props.more && this.props.posts.length > 0) {
            load = "Show More Posts";
            loadClick = true;
            loadClass = "TopicPortal-load";
        }
        if ((this.props.loadingMore && this.props.posts.length <= 0) || this.props.loadHide) {
            load = "";
            loadClass = "TopicPortal-loaded";
        }
        else if (this.props.loadingMore) {
            load = "Loading More Posts...";
            cover = " LoadingCover-anim";
        }
        else if (this.props.posts.length <= 0) {
            load = "No Posts";
            loadClass = "TopicPortal-loaded";
        }

        return (
            <div className="TopicPortal">
                <div className='TopicPortal-posts'>
                    {this.props.posts}
                </div>
                <div className={loadClass} onClick={loadClick ? this.loadPosts : undefined}>
                    <div className={'LoadingCover' + cover}></div>
                    {load}
                </div>
            </div>
        );
    }
}
