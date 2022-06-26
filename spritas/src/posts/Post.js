import React from 'react';
import he from 'he';
import './Post.css';
import Reply from '../create/Reply';
import pfp from '../images/pfp.png';
import relativeTime from '../functions/relativeTime';

export default class Post extends React.Component {
    constructor(props) {
        super(props);
        this.loadReplies = this.loadReplies.bind(this);
        this.extendReplies = this.extendReplies.bind(this);
        this.collapse = this.collapse.bind(this);
        this.delete = this.delete.bind(this);
        this.state = ({
            replies: null,
            offset: 0,
            amount: 4,
            more: false,
            collapsed: false,
            toggleTime: false,
            loadingMore: false
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
                            <Post key={index} post={reply} opid={this.props.opid} user={this.props.user} /> );
                        this.setState({
                            replies: replies
                        });
                    }
                    if (data.length < (this.state.amount + 1)) {
                        this.setState({
                            more: false
                        });
                    } else {
                        this.setState(state => ({
                            offset: state.offset + this.state.amount,
                            more: true
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
                        opid={this.props.opid} user={this.props.user} /> );
                var rep = document.getElementById('Replies-' + this.props.post.id);
                let maxHeight = rep.scrollHeight;
                rep.style.height = maxHeight + "px";
                this.setState(state => ({
                    replies: [...moreReplies, ...state.replies],
                    loadingMore: false
                }), () => this.extendReplies())
                if (data.length < (this.state.amount + 1)) {
                    this.setState({
                        more: false
                    });
                } else {
                    this.setState(state => ({
                        offset: state.offset + this.state.amount,
                        more: true
                    }));
                }
            })
            .catch(error => this.setState({ loadingMore: false }));
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

    delete() {
        const post = this.props.post;
        var answer = prompt(`Are you sure you want to delete this reply?\nType the username "${post.username}" to confirm:`, '');
        if (answer === post.username) {
            var myBody = new URLSearchParams();
            myBody.append('id', post.id);
            
            fetch('/delete/reply', {
                method: 'POST',
                body: myBody
            })
            .then((resp) => {
                if (resp.ok) window.location.href = '/';
                else alert('Post deletion error');
            })
        } else if (answer !== null) alert(`Value incorrect. Post not deleted.`);
    }

    render() {
        const post = this.props.post;

        var ts = new Date(post.ts);
        var relTime = relativeTime(post.ts);
        ts = `${('0' + ts.getHours()).slice(-2)}:${('0' + ts.getMinutes()).slice(-2)} on ${ts.toDateString()}`;
        relTime = `${relTime}`;

        const time = (!this.state.toggleTime) ?
        <p className="Post-ts" title={ts} onClick={() => this.setState({ toggleTime: true})}>{relTime}</p> :
        <p className="Post-ts" title={relTime} onClick={() => this.setState({ toggleTime: false})}>{ts}</p>;

        const avatar = (post.avatar) ? `/media/avatars/${post.avatar}` : pfp;

        var reply;
        if ((this.props.user && this.props.user.type === "BAN") || (this.props.blockers && this.props.blockers.includes(this.props.opid))) reply = null;
        else if (this.props.blockers && this.props.blockers.includes(post.idUser)) reply = <p className="PostContainer-banBlock">{post.nickname} Has Blocked You From Replying</p>;
        else if (this.props.user) reply = <Reply id={post.id} user={this.props.user} />;

        const replies = (this.props.reply) ?
        <div>
            <div className="Post-replies" id={"Replies-" + post.id}>
                {this.state.replies}
            </div>
            {reply}
        </div>
        : null;

        var loadMsg = "Show Older Replies";
        var cover = ""
        if (this.state.loadingMore) {
            loadMsg = "Loading More Replies...";
            cover = " LoadingCover-anim";
        }
        var load = null;
        if (this.props.reply && this.state.more) {
            load = <div className="Post-load" onClick={() => this.setState({
                loadingMore: true
            }, () => this.loadReplies())}>
                <div className={'LoadingCover' + cover}></div>
                {loadMsg}
            </div>;
        }

        var collapse = null;
        if (this.props.reply && this.state.replies) {
            collapse = (this.state.collapsed) ?
            <div className="Post-collapse" onClick={this.collapse}>Show Replies</div> :
            <div className="Post-collapse" onClick={this.collapse}>Hide Replies</div>
        }

        const youreply = (this.props.user && this.props.user.id === post.idUser) ? " Post-replyyou" : "";
        const opOrYou = (this.props.user && this.props.user.id === this.props.opid) ? "Post-optag" : "Post-youtag";
        const youtag = (youreply) ? <span className={opOrYou} title="You"> YOU</span> : null;

        const op = (this.props.op) ? " Post-op" : "";
        const opreply = (this.props.opid === post.idUser) ? " Post-replyop" : "";
        const optag = ((op || opreply) && !youreply) ? <span className="Post-optag" title="Original Poster"> OP</span> : null;

        const deleted = (post.update === 'DELE') ? ' Post-bodyDel' : '';

        const deleteReply = (post.type === 'RPLY' && post.update !== 'DELE' && this.props.user &&
        (this.props.user.id === post.idUser || this.props.user.type === 'ADMN') && this.props.user.type !== "BAN") ? (
            <div className='Post-delete' onClick={this.delete} title='Delete Reply'>Delete</div>
        ) : null;

        const reportReply = (post.type === 'RPLY' && post.update !== 'DELE' && this.props.user && this.props.user.id !== post.idUser && this.props.user.type !== 'ADMN' && this.props.user.type !== 'BAN') ? (
            <div className='Post-delete' title='Report Reply'>Report</div>
        ) : null;

        const actions = (
            <div className='Post-actions'>
                {deleteReply}
                {reportReply}
            </div>
        )

        return (
            <div className={"Post" + op + opreply + youreply} id={"p" + post.id} style={{animationDelay: `${this.props.delay * 100}ms`}}>
                <div className="Post-main">
                    <div className='Post-info'>
                        <a className='Post-a' href={`/u/${post.username}`} title={"@" + post.username}>
                            <div className="Post-user">
                                <img className="Post-user-img" src={avatar} alt="User" />
                                <p className="Post-nickname">{post.nickname}{optag}{youtag}</p>
                            </div>
                        </a>
                        {time}
                    </div>
                    <p className={"Post-body" + deleted}>{he.decode(post.body)}</p>
                    {actions}
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