import React from 'react';
import he from 'he';
import './Post.css';
import Reply from '../create/Reply';
import pfp from '../images/pfp.png';

export default class Post extends React.Component {
    constructor(props) {
        super(props);
        this.loadReplies = this.loadReplies.bind(this);
        this.extendReplies = this.extendReplies.bind(this);
        this.collapse = this.collapse.bind(this);
        this.state = ({
            replies: null,
            offset: 0,
            amount: 4,
            more: true,
            collapsed: false
         });
    }

    componentDidMount() {
        if (this.props.reply) {
            const id = this.props.post.id;

            fetch(`/rr/${id}.${this.state.offset}.${this.state.amount}`)
                .then(res => res.json())
                .then(data => {
                    if (data.length > 0) {
                        const replies = data.slice(0, this.state.amount).reverse().map((reply, index) =>
                            <Post key={index} post={reply} opid={this.props.opid} /> );
                        this.setState({
                            replies: replies
                        }, () => this.extendReplies());
                    }
                    if (data.length < (this.state.amount + 1)) {
                        this.setState(state => ({
                            more: !state.more
                        }));
                    } else {
                        this.setState(state => ({
                            offset: state.offset + this.state.amount
                        }));
                    }
                })
        }
    }

    loadReplies() {
        const id = this.props.post.id;

        fetch(`/rr/${id}.${this.state.offset}.${this.state.amount}`)
            .then(res => res.json())
            .then(data => {
                const moreReplies = data.slice(0, this.state.amount).reverse().map((reply, index) => 
                    <Post key={index + this.state.offset} post={reply}
                        opid={this.props.opid} /> );
                var rep = document.getElementById('Replies-' + this.props.post.id);
                let maxHeight = rep.scrollHeight;
                rep.style.height = maxHeight + "px";
                this.setState(state => ({
                    replies: [...moreReplies, ...state.replies]
                }), () => this.extendReplies())
                if (data.length < (this.state.amount + 1)) {
                    this.setState(state => ({
                        more: !state.more
                    }));
                } else {
                    this.setState(state => ({
                        offset: state.offset + this.state.amount
                    }));
                }
            })
    }

    extendReplies() {
        var rep = document.getElementById('Replies-' + this.props.post.id);
        if (rep) {
            let maxHeight = rep.scrollHeight;
            rep.style.height = maxHeight + "px";
            rep.scrollTop = maxHeight;
            if (this.state.collapsed) this.setState({ collapsed: false });
            const controller = new AbortController();
            rep.addEventListener('transitionend', (e) => {
                if (e.currentTarget === e.target) {
                    rep.style.height = "auto";
                    controller.abort();
                }
            }, {signal: controller.signal});
        }
    }

    collapse() {
        this.setState(state => ({
            collapsed: !state.collapsed
        }), () => {
            var rep = document.getElementById('Replies-' + this.props.post.id);
            if (this.state.collapsed) {
                let maxHeight = rep.scrollHeight;
                rep.style.height = maxHeight + "px";
                setTimeout(() => rep.style.height = "0px", 10);
            } else {
                let maxHeight = rep.scrollHeight;
                rep.style.height = maxHeight + "px";
                const controller = new AbortController();
                rep.addEventListener('transitionend', (e) => {
                    if (e.currentTarget === e.target && rep.style.height !== "0px") {
                        rep.style.height = "auto";
                        controller.abort();
                    }
                }, {signal: controller.signal});
            }
        });
    }

    render() {
        const post = this.props.post;

        var ts = new Date(post.ts);
        ts = `Posted at ${('0' + ts.getHours()).slice(-2)}:${('0' + ts.getMinutes()).slice(-2)} on
        ${ts.toDateString()}`;

        const replies = (this.props.reply) ?
        <div>
            <div className="Post-replies" id={"Replies-" + post.id}>
                {this.state.replies}
            </div>
            <Reply parentId={post.id} />
        </div>
        : null;

        var load = null;
        if (this.props.reply && this.state.more) {
            load = <div className="Post-load" onClick={this.loadReplies}>Load More</div>;
        }

        var collapse = null;
        if (this.props.reply && this.state.replies) {
            collapse = (this.state.collapsed) ?
            <div className="Post-collapse" onClick={this.collapse}>Show Replies</div> :
            <div className="Post-collapse" onClick={this.collapse}>Hide Replies</div>
        } else if (this.props.reply) collapse = <div className="Post-gap" />;

        const op = (this.props.op) ? " Post-op" : "";
        const opreply = (this.props.opid === post.idUser) ? " Post-replyop" : "";
        const optag = (op || opreply) ? <span className="Post-optag" title="Original Poster"> OP</span> : null;

        return (
            <div className={"Post" + op + opreply} id={"p" + post.id}>
                <div className="Post-main">
                    <div className="Post-user">
                        <img className="Post-user-img" src={pfp} alt="User" />
                        <div className="Post-user-info">
                            <p className="Post-user-name">{post.userName}{optag}</p>
                            <p className="Post-user-type">{post.userType}</p>
                        </div>
                    </div>
                    <div className="Post-right">
                        <div className="Post-body">{he.decode(post.body)}</div>
                        <div className="Post-footer">{ts}</div>
                    </div>
                </div>
                <div className="Post-controls">
                    {collapse}
                    {load}
                </div>
                {replies}
            </div>
        );
    }
}