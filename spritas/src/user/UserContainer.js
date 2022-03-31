import React from 'react';
import './UserContainer.css';
import UserCard from './UserCard';
import TopicPortal from '../topics/TopicPortal';
import TopicPost from '../topics/TopicPost';

export default class UserContainer extends React.Component {
    constructor(props) {
        super(props);
        this.loadPosts = this.loadPosts.bind(this);
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
                if (this.state.thisUser) document.title = `${this.state.thisUser.name} - The Spritas`;
            }); });

        this.loadPosts();
    }

    loadPosts() {
        const id = (this.props.id) ? this.props.id : this.props.match.params.id;

        fetch(`/user/posts/${id}.${this.state.offset}.${this.state.amount}`)
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    const posts = data.slice(0, this.state.amount).map((post, index) =>
                    <TopicPost key={index + this.state.offset} post={post}
                        postClick={this.props.postClick} />);
                    this.setState(state => ({
                        posts: [...posts, ...state.posts]
                    }));
                    if (data.length < (this.state.amount + 1)) {
                        this.setState(state => ({
                            more: !state.more
                        }));
                    } else {
                        this.setState(state => ({
                            offset: state.offset + this.state.amount
                        }));
                    }
                }
            });
    }

    render() {
        const posts = (this.state.posts) ? this.state.posts : null;

        var load = null;
        if (this.state.more) {
            load = <div className="Post-load" onClick={this.loadReplies}>Load More</div>;
        }

        return (
            <div className='UserContainer'>
                <UserCard user={this.props.user} thisUser={this.state.thisUser} />
                <div className='UserContainer-topics'>
                    <TopicPortal posts={posts} />
                </div>
            </div>
        )
    }
}