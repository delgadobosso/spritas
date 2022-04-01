import React from 'react';
import './UserContainer.css';
import UserCard from './UserCard';
import TopicPortal from '../topics/TopicPortal';
import TopicPost from '../topics/TopicPost';

export default class UserContainer extends React.Component {
    constructor(props) {
        super(props);
        this.loadPosts = this.loadPosts.bind(this);
        this.extendPosts = this.extendPosts.bind(this);
        this.state = {
            thisUser: null,
            posts: [],
            offset: 0,
            amount: 10,
            more: true
        }
    }

    componentDidMount() {
        const id = (this.props.id) ? this.props.id : this.props.match.params.id;

        fetch(`/user/${id}`)
            .then(res => res.json())
            .then(data => { this.setState({
                thisUser: data
            }, () => {
                if (this.state.thisUser) {
                    document.title = `${this.state.thisUser.name} - The Spritas`;
                    const nameUrl = this.state.thisUser.name.replaceAll(' ', '_');
                    window.history.replaceState(window.history.state, "", `/user/${id}/${nameUrl}`);
                    window.history.scrollRestoration = 'manual';
                }
            }); });

        this.loadPosts(true);
    }

    loadPosts(first=false) {
        const id = (this.props.id) ? this.props.id : this.props.match.params.id;

        fetch(`/user/posts/${id}.${this.state.offset}.${this.state.amount}`)
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    const posts = data.slice(0, this.state.amount).map((post, index) =>
                    <TopicPost key={index + this.state.offset} post={post}
                        postClick={this.props.postClick} />);
                    if (data.length < (this.state.amount + 1)) {
                        this.setState(state => ({
                            more: !state.more
                        }));
                    } else {
                        this.setState(state => ({
                            offset: state.offset + this.state.amount
                        }));
                    }
                    if (!first) {
                        var sub = document.getElementById('UserContainer-topics');
                        let maxHeight = sub.scrollHeight;
                        sub.style.height = maxHeight + "px";
                    }
                    this.setState(state => ({
                        posts: [...state.posts, ...posts]
                    }), () => { if (!first) this.extendPosts(sub) });
                }
            });
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
        const posts = (this.state.posts) ? this.state.posts : null;

        return (
            <div className='UserContainer'>
                <UserCard user={this.props.user} thisUser={this.state.thisUser} />
                <div className='UserContainer-container'>
                    <div className='UserContainer-topics' id='UserContainer-topics'>
                        <TopicPortal posts={posts} more={this.state.more} load={this.loadPosts} />
                    </div>
                </div>
            </div>
        )
    }
}