import React from 'react';
import './Topic.css';
import status from '../images/spritan.png';
import TopicPortal from './TopicPortal';
import TopicPost from './TopicPost';
import he from 'he';

export default class Topic extends React.Component {
    constructor(props) {
        super(props);
        this.loadPosts = this.loadPosts.bind(this);
        this.state = {
            posts: [],
            offset: 0,
            amount: 24,
            more: true
        };
    }

    componentDidMount() {
        this.loadPosts(true);
    }

    loadPosts(first=false) {
        fetch(`/home/${this.props.feed}/${this.state.offset}.${this.state.amount}`)
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    var newPosts = data.slice(0, this.state.amount).map((post, index) =>
                        <TopicPost key={index + this.state.offset} post={post}
                            postClick={this.props.postClick} delay={index} />);

                    if (data.length < (this.state.amount + 1)) {
                        this.setState(state => ({
                            more: !state.more
                        }));
                    } else {
                        this.setState(state => ({
                            offset: state.offset + this.state.amount
                        }))
                    }
                    if (!first) {
                        var sub = document.getElementById(`Topic-${this.props.feed}`);
                        let maxHeight = sub.scrollHeight;
                        sub.style.height = maxHeight + "px";
                    }
                    this.setState(state => ({
                        posts: [...state.posts, newPosts]
                    }), () => { if (!first) this.extendPosts(sub)});
                }
            })
    }

    extendPosts(sub) {
        if (sub) {
            let maxHeight = sub.scrollHeight;
            sub.style.height = maxHeight + "px";
            const controller = new AbortController();
            sub.addEventListener('transitionend', (e) => {
                if (e.currentTarget === e.target) {
                    sub.style.height = "auto";
                    controller.abort();
                }
            }, {signal: controller.signal});
        }
    }

    render() {
        return (
            <div className="Topic" id={`Topic-${this.props.feed}`}>
                <TopicPortal posts={this.state.posts} more={this.state.more} load={this.loadPosts} />
            </div>
        );
    }
}