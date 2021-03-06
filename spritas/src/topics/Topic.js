import React from 'react';
import './Topic.css';
import TopicPortal from './TopicPortal';
import TopicPost from './TopicPost';

export default class Topic extends React.Component {
    constructor(props) {
        super(props);
        this.loadPosts = this.loadPosts.bind(this);
        this.state = {
            posts: [],
            offset: 0,
            amount: 24,
            more: false,
            loadingMore: false
        };
    }

    componentDidMount() {
        this.loadPosts(true);
    }

    loadPosts(first=false) {
        if (!this.state.loadingMore) {
            this.setState({
                loadingMore: true
            }, () => {
                fetch(`/home/${this.props.feed}/${this.state.offset}.${this.state.amount}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.length > 0) {
                            var newPosts = data.slice(0, this.state.amount).map((post, index) =>
                                <TopicPost key={post.id} post={post}
                                    postClick={this.props.postClick} delay={index} />);
                            if (!first) {
                                var sub = document.getElementById(`Topic-${this.props.feed}`);
                                let maxHeight = sub.scrollHeight;
                                sub.style.height = maxHeight + "px";
                            }
                            this.setState(state => ({
                                posts: [...state.posts, newPosts],
                                loadingMore: false,
                                more: !(data.length < (this.state.amount + 1)),
                                offset: state.offset + this.state.amount
                            }), () => { if (!first) this.extendPosts(sub)});
                        } else this.setState({ loadingMore: false });
                    })
                    .catch(error => this.setState({ loadingMore: false }));
            });

        }

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
                <TopicPortal posts={this.state.posts} more={this.state.more} load={this.loadPosts} loadingMore={this.state.loadingMore} />
            </div>
        );
    }
}