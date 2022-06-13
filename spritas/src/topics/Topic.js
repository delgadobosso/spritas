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
        this.delete = this.delete.bind(this);
        this.state = {
            subtopics: false,
            topics: [],
            posts: [],
            controls: [],
            offset: 0,
            amount: 24,
            more: true
        };
    }

    componentDidMount() {
        var con = document.getElementById(`Topic-${this.props.topic.id}`);
        var naviTime = false;
        var prevScroll = con.scrollTop;
        con.onscroll = () => {
          clearTimeout(naviTime);
          naviTime = setTimeout(() => {
            var down = prevScroll < con.scrollTop;
            this.props.naviHide(down);
            prevScroll = con.scrollTop;
          }, 50);
        }

        const name = this.props.topic.name;

        const id = this.props.topic.id;
        const type = this.props.topic.type;
        const perm = this.props.topic.perm;
        fetch(`/home/${id}.${this.state.offset}.${this.state.amount}`)
            .then(res => res.json())
            .then(data => {
                var controls = [];
                if (this.props.user) {
                    if (this.props.user.type === "ADMN") {
                        controls.push(<a className="TopicPortal-control-item" href={`/create/topic/${id}`} key="1">Create Topic</a>);
                        controls.push(<a className="TopicPortal-control-item" onClick={this.delete} key="2">Delete Topic</a>);
                    }
                    if (((perm === "ADMN" && this.props.user.type === perm) || perm !== "ADMN") && this.props.user.type !== 'BAN') {
                        controls.push(<a className="TopicPortal-control-item" href={`/create/post/${id}?type=${type}`} key="0">Create Post</a>);
                    }
                }
                if (data.length > 0) {
                    var topics = [];
                    var posts = [];
                    data.forEach((subtopic, index) => {
                        if (subtopic.hasOwnProperty('idTopic')) posts.push(
                            <TopicPost key={index} post={subtopic}
                                postClick={this.props.postClick} />);
                        else topics.push(
                            <Topic key={index} topic={subtopic}
                                    user={this.props.user} postClick={this.props.postClick} />);
                    });
                    // Check if there are more posts to load
                    if (posts.length < (this.state.amount + 1)) {
                        this.setState(state => ({
                            more: !state.more
                        }));
                    } else {
                        posts.pop();
                        this.setState(state => ({
                            offset: state.offset + this.state.amount
                        }));
                    }
                    this.setState({
                        subtopics: true,
                        topics: topics,
                        posts: posts,
                        controls: controls
                    }, () => this.openSubtopic(name));
                } else if (controls.length > 0) {
                    this.setState({
                        subtopics: true,
                        controls: controls,
                        more: false
                    }, () => this.openSubtopic(name));
                }
            });
    }

    openSubtopic(name) {
        var sub = document.getElementById("Subtopic-" + name.replace(" ", ""));
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

    closeSubtopic(name) {
        var sub = document.getElementById("Subtopic-" + name.replace(" ", ""));
        if (sub) {
            let maxHeight = sub.scrollHeight;
            sub.style.height = maxHeight + "px";
            setTimeout(() => sub.style.height = "0px", 10);
            const controller = new AbortController();
            sub.addEventListener('transitionend', (e) => {
                    if (e.currentTarget === e.target) {
                    this.setState({
                        subtopics: "",
                        offset: 0,
                        more: true
                    });
                    controller.abort();
                }
            }, {signal: controller.signal});
        }
    }

    loadPosts() {
        const id = this.props.topic.id;

        fetch(`/home/${id}.${this.state.offset}.${this.state.amount}`)
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    var newPosts = data.slice(0, this.state.amount).map((post, index) =>
                        <TopicPost key={index + this.state.offset} post={post}
                            postClick={this.props.postClick} />);

                    if (data.length < (this.state.amount + 1)) {
                        this.setState(state => ({
                            more: !state.more
                        }));
                    } else {
                        this.setState(state => ({
                            offset: state.offset + this.state.amount
                        }))
                    }
                    const name = this.props.topic.name;
                    var sub = document.getElementById("Subtopic-" + name.replace(" ", ""));
                    let maxHeight = sub.scrollHeight;
                    sub.style.height = maxHeight + "px";
                    this.setState(state => ({
                        posts: [...state.posts, newPosts]
                    }), () => this.extendPosts(sub));
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

    delete() {
        const id = this.props.topic.id;
        const name = this.props.topic.name;
        var answer = prompt(`Are you sure you want to delete this topic? Children topics and posts will NOT be deleted, but made inaccessible.\nType "${name}" to confirm:`, '');
        if (answer === name) {
            var myBody = new URLSearchParams();
            myBody.append('id', id);

            fetch('/delete/topic', {
                method: 'POST',
                body: myBody
            })
            .then((resp) => {
                if (resp.ok) window.location.href = '/';
                else console.error('Topic deletion error');
            })
        } else if (answer !== null) alert(`Value incorrect. Post not deleted.`);
    }

    render() {
        const topic = this.props.topic;

        const subtopics = (this.state.subtopics) ?
        <div className="Subtopic" id={"Subtopic-" + topic.name.replace(" ", "")}>
            <TopicPortal topics={this.state.topics} posts={this.state.posts} controls={this.state.controls} more={this.state.more} load={this.loadPosts} id={topic.id} naviHide={this.props.naviHide} />
        </div>
        : null;

        var open = (this.state.subtopics) ? " Topic-linkopen" : "";

        return (
            <div className="Topic" id={`Topic-${this.props.topic.id}`}>
                {subtopics}
            </div>
        );
    }
}