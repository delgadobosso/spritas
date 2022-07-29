import React from 'react';
import he from 'he';
import './Reply.css';
import CreateReply from '../create/CreateReply';
import pfp from '../images/pfp.png';
import relativeTime from '../functions/relativeTime';

import { AppContext } from '../contexts/AppContext';

export default class Reply extends React.Component {
    constructor(props) {
        super(props);
        this.resizeHandle = this.resizeHandle.bind(this);
        this.loadReplies = this.loadReplies.bind(this);
        this.loadRepliesPrev = this.loadRepliesPrev.bind(this);
        this.loadRepliesNext = this.loadRepliesNext.bind(this);
        this.extendReplies = this.extendReplies.bind(this);
        this.correctExtend = this.correctExtend.bind(this);
        this.collapse = this.collapse.bind(this);
        this.delete = this.delete.bind(this);
        this.report = this.report.bind(this);
        this.reloadReplies = this.reloadReplies.bind(this);
        this.collapsable = this.collapsable.bind(this);
        this.expand = this.expand.bind(this);
        this.share = this.share.bind(this);
        this.state = ({
            replies: [],
            offset: 0,
            amount: 4,
            more: false,
            offsetPrev: 0,
            amountPrev: 4,
            morePrev: false,
            offsetNext: 0,
            amountNext: 4,
            moreNext: false,
            collapsed: false,
            toggleTime: false,
            loadingMore: false,
            collapsable: false,
            expand: false,
            resize: true,
            deleting: false,
            share: false,
            shareUrl: null
         });
    }

    componentDidMount() {
        window.addEventListener('resize', this.resizeHandle);

        this.collapsable();
        if (this.props.reply && !this.props.idSub) this.loadReplies(true);
        else if (this.props.idSub) this.loadRepliesPrev(true);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeHandle);
    }

    resizeHandle() {
        // Throttle resize handle
        if (this.state.resize) {
            this.setState({ resize: false });
            setTimeout(() => this.setState({ resize: true }, () => this.collapsable()), 500);
        }
    }

    loadReplies(first=false, reload=false) {
        if (!this.state.loadingMore) {
            this.setState({
                loadingMore: true
            }, () => {
                const id = this.props.post.id;
                fetch(`/repliesreplies/${id}.${this.state.offset}.${this.state.amount}`)
                    .then(res => res.json())
                    .then(data => {
                        const moreReplies = data.slice(0, this.state.amount).reverse().map((reply) => 
                            <Reply key={reply.id} post={reply}
                                opid={this.props.opid} user={this.props.user} reload={this.reloadReplies} /> );
                        var rep = document.getElementById('Replies-' + this.props.post.id);
                        if (rep && !first) {
                            let maxHeight = rep.scrollHeight;
                            rep.style.height = maxHeight + "px";
                        }
                        this.setState(state => ({
                            replies: [...moreReplies, ...state.replies],
                            loadingMore: false,
                            more: !(data.length < (this.state.amount + 1)),
                            offset: state.offset + this.state.amount
                        }), () => {
                            if (!first && !reload) this.extendReplies();
                            if (reload) this.correctExtend(data);
                            if (first && this.props.focus) {
                                const rep = document.getElementById(`rMain${this.props.post.id}`);
                                if (rep) rep.scrollIntoView({ behavior: 'smooth' });
                            }
                        })
                    })
                    .catch(error => this.setState({ loadingMore: false }));
            });
        }
    }

    loadRepliesPrev(first=false) {
        if (!this.state.loadingMore) {
            this.setState({
                loadingMore: true
            }, () => {
                const id = this.props.post.id;
                const idSub = this.props.idSub;
                const amount = (first) ? 2 : this.state.amountPrev;
                fetch(`/repliesprev/${id}.${idSub}.${this.state.offsetPrev}.${amount}`)
                    .then(res => res.json())
                    .then(data => {
                        const moreReplies = data.slice(0, amount).reverse().map((reply) => 
                            <Reply key={reply.id} post={reply}
                                opid={this.props.opid} user={this.props.user} reload={this.reloadReplies} /> );
                        var rep = document.getElementById('Replies-' + this.props.post.id);
                        if (rep && !first) {
                            let maxHeight = rep.scrollHeight;
                            rep.style.height = maxHeight + "px";
                        }
                        this.setState(state => ({
                            replies: [...moreReplies, ...state.replies],
                            loadingMore: false,
                            morePrev: !(data.length < (amount + 1)),
                            offsetPrev: state.offsetPrev + amount
                        }), () => {
                            if (!first) this.extendReplies();
                            else {
                                this.loadRepliesNext(true);
                                const rep = document.getElementById(`rMain${this.props.idSub}`);
                                if (rep) rep.style.background = 'linear-gradient(275deg, var(--darkest-grey), var(--spritan-fade-gold))';
                            }
                        })
                    })
                    .catch(error => this.setState({ loadingMore: false }));
            });
        }
    }

    loadRepliesNext(first=false) {
        if (!this.state.loadingMore) {
            this.setState({
                loadingMore: true
            }, () => {
                const id = this.props.post.id;
                const idSub = this.props.idSub;
                const amount = (first) ? 1 : this.state.amountNext;
                fetch(`/repliesnext/${id}.${idSub}.${this.state.offsetNext}.${amount}`)
                    .then(res => res.json())
                    .then(data => {
                        const moreReplies = data.slice(0, amount).map((reply) => 
                            <Reply key={reply.id} post={reply}
                                opid={this.props.opid} user={this.props.user} reload={this.reloadReplies} /> );
                        var rep = document.getElementById('Replies-' + this.props.post.id);
                        if (rep && !first) {
                            let maxHeight = rep.scrollHeight;
                            rep.style.height = maxHeight + "px";
                        }
                        this.setState(state => ({
                            replies: [...state.replies, ...moreReplies],
                            loadingMore: false,
                            moreNext: !(data.length < (amount + 1)),
                            offsetNext: state.offsetNext + amount
                        }), () => {
                            if (!first) this.extendReplies(false);
                            else {
                                const rep = document.getElementById(`rMain${idSub}`);
                                rep.scrollIntoView({ behavior: 'smooth' });
                            }
                        })
                    })
                    .catch(error => this.setState({ loadingMore: false }));
            });
        }
    }

    extendReplies(fromBottom = true) {
        var rep = document.getElementById('Replies-' + this.props.post.id);
        if (rep) {
            let maxHeight = rep.scrollHeight;
            rep.style.height = maxHeight + "px";
            if (fromBottom) rep.scrollTop = maxHeight;
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

    correctExtend(replies) {
        var totalHeight = 0;
        var parentId;
        replies.slice(0, this.state.amount).forEach(reply => {
            totalHeight += document.getElementById(`r${reply.id}`).offsetHeight;
            parentId = reply.idParent;
        });
        
        var rep = document.getElementById('Replies-' + this.props.post.id);
        var parent = document.getElementById(`r${parentId}`);
        if (rep && totalHeight !== rep.clientHeight) {
            rep.style.height = totalHeight + "px";
            if (parent) parent.scrollIntoView({ behavior: "smooth" });
            if (this.state.collapsed) this.setState({ collapsed: false });
            const controller = new AbortController();
            rep.addEventListener('transitionend', (e) => {
                if (e.currentTarget === e.target) {
                    rep.style.height = "auto";
                    controller.abort();
                }
            }, {signal: controller.signal});
        } else if (rep) {
            rep.style.height = "auto";
            if (parent) parent.scrollIntoView({ behavior: "smooth" });
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
                setTimeout(() => rep.style.height = "30px", 10);
            } else {
                let maxHeight = rep.scrollHeight;
                rep.style.height = maxHeight + "px";
                const controller = new AbortController();
                rep.addEventListener('transitionend', (e) => {
                    if (e.currentTarget === e.target && rep.style.height !== "30px") {
                        rep.style.height = "auto";
                        controller.abort();
                    }
                }, {signal: controller.signal});
            }
        });
    }

    delete() {
        if (!this.state.deleting) {
            const post = this.props.post;
            var answer = prompt(`Are you sure you want to delete this reply?\nType the username "${post.username}" to confirm:`, '');
            if (answer === post.username) {
                var reason = prompt(`Why are you deleting this reply?`, '');
                if (reason) {
                    this.setState({ deleting: true }, () => {
                        var myBody = new URLSearchParams();
                        myBody.append('id', post.id);
                        myBody.append('reason', reason);
                        
                        fetch('/delete/reply', {
                            method: 'POST',
                            body: myBody
                        })
                        .then((resp) => {
                            this.setState({ deleting: false }, () => {
                                if (resp.ok) {
                                    this.context.toastPush('success', 'dr');
                                    this.props.reload();
                                }
                                else {
                                    this.context.toastPush('failure', 'dr');
                                };
                            });
                        })
                        .catch(error => {
                            this.context.toastPush('failure', 'dr');
                            this.setState({ deleting: false });
                        });
                    })
                } else if (reason === '') alert(`You must give a reason to delete this reply.`);
            } else if (answer !== null) alert(`Value incorrect. Reply not deleted.`);
        }
    }

    report() {
        var answer = prompt(`Why are you reporting this reply?`, '');
        if (answer) {
            var myBody = new URLSearchParams();
            myBody.append('id', this.props.post.id);
            myBody.append('reason', answer);

            fetch('/report/reply', {
                method: 'POST',
                body: myBody
            })
            .then((resp) => {
                if (resp.ok) this.context.toastPush('success', 'rr');
                else this.context.toastPush('failure', 'rr');
            });
        } else if (answer === '') alert(`You must give a reason to report this reply.`);
    }

    reloadReplies() {
        var repliesElem = document.getElementById('Replies-' + this.props.post.id);
        var beforeHeight = repliesElem.scrollHeight;

        this.setState({
            replies: [],
            offset: 0,
            offsetPrev: 0,
            offsetNext: 0,
            more: false,
            morePrev: false,
            moreNext: false,
            collapsed: false
        }, () => {
            repliesElem.style.height = beforeHeight + "px";
            this.loadReplies(false, true);
        });
    }

    collapsable() {
        const post = document.getElementById(`rMain${this.props.post.id}`);
        if (post && post.scrollHeight > 300) {
            post.style.height = '300px';
            this.setState({
                collapsable: true,
                expand: false
            });
        }
        else {
            this.setState({
                collapsable: false,
                expand: false
            });
        }
    }

    expand() {
        const post = document.getElementById(`rMain${this.props.post.id}`);
        const durr = (post.scrollHeight > 1000) ? 1000 : 500;

        if (!this.state.expand) this.setState({
            expand: true
        }, () => {
            post.getAnimations().map(animation => animation.cancel());
            post.animate([
                { height: `300px` },
                { height: `${post.scrollHeight + 50}px` }
            ], { duration: durr, easing: 'ease' });
            post.style.height = `${post.scrollHeight + 50}px`;
        });
        else this.setState({
            expand: false
        }, () => {
            post.scrollIntoView({ behavior: "smooth" });
            post.getAnimations().map(animation => animation.cancel());
            post.animate([
                { height: `${post.scrollHeight}px` },
                { height: `300px` },
            ], { duration: durr, easing: 'ease' });
            post.style.height = `300px`;
        });
    }

    share() {
        const post = this.props.post;
        var url = (window.location.port) ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}` :
        `${window.location.protocol}//${window.location.hostname}`;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(`${url}/p/${post.idPost}/r/${post.id}`)
            .then(() => {
                this.setState({
                    share: true
                }, () => setTimeout(() => this.setState({ share: false }), 3000));
            }, (reason) => console.error(reason));
        } else this.setState({ shareUrl: `${url}/p/${post.idPost}/r/${post.id}` });
    }

    render() {
        const post = this.props.post;

        var ts = new Date(post.ts);
        var relTime = relativeTime(post.ts);
        ts = `${('0' + ts.getHours()).slice(-2)}:${('0' + ts.getMinutes()).slice(-2)} on ${ts.toDateString()}`;

        const time = (!this.state.toggleTime) ?
        <p className="Post-ts" title={ts} onClick={() => this.setState({ toggleTime: true})}>{relTime}</p> :
        <p className="Post-ts" title={relTime} onClick={() => this.setState({ toggleTime: false})}>{ts}</p>;

        const avatar = (post.avatar) ? `/media/avatars/${post.avatar}` : pfp;

        var reply;
        if ((this.props.user && this.props.user.type === "BAN") || (this.props.blockers && this.props.blockers.includes(this.props.opid))) reply = null;
        else if (this.props.blockers && this.props.blockers.includes(post.idUser)) reply = <p className="PostContainer-banBlock">{post.nickname} Has Blocked You From Replying</p>;
        else if (this.props.user) reply = <CreateReply id={post.id} user={this.props.user} reload={this.reloadReplies} target={'comment'} />;

        var loadMsg = "Show Older Replies";
        var loadMsgNext = "Show Newer Replies";
        var cover = ""
        if (this.state.loadingMore) {
            loadMsg = "Loading More Replies...";
            loadMsgNext = "Loading More Replies...";
            cover = " LoadingCover-anim";
        }
        var load;
        if (this.props.reply && this.state.more) {
            load = <div className="Post-load" onClick={() => this.loadReplies()}>
                <div className={'LoadingCover' + cover}></div>
                {loadMsg}
            </div>;
        }
        var loadPrev;
        if (this.props.reply && this.state.morePrev) {
            loadPrev = <div className="Post-load" onClick={() => this.loadRepliesPrev()}>
                <div className={'LoadingCover' + cover}></div>
                {loadMsg}
            </div>;
        }
        var loadNext;
        if (this.props.reply && this.state.moreNext) {
            loadNext = <div className="Post-load Post-loadNext" onClick={() => this.loadRepliesNext()}>
                <div className={'LoadingCover' + cover}></div>
                {loadMsgNext}
            </div>;
        }

        var collapseCover = (this.state.collapsed) ? " Post-collapseCover" : "";
        const replies = (this.props.reply) ?
        <div>
            {load}
            {loadPrev}
            <div className="Post-replies" id={"Replies-" + post.id}>
                <div className={'Post-repliesCover' + collapseCover}></div>
                {this.state.replies}
            </div>
            {loadNext}
            {reply}
        </div>
        : null;

        const youreply = (this.props.user && this.props.user.id === post.idUser) ? " Post-replyyou" : "";
        const opOrYou = (this.props.user && this.props.user.id === this.props.opid) ? "Post-optag" : "Post-youtag";
        const youtag = (youreply) ? <span className={opOrYou} title="You"> YOU</span> : null;

        const op = (this.props.op) ? " Post-op" : "";
        const opreply = (this.props.opid === post.idUser) ? " Post-replyop" : "";
        const optag = ((op || opreply) && !youreply) ? <span className="Post-optag" title="Original Poster"> OP</span> : null;

        const deleted = (post.status === 'DELE') ? ' Post-bodyDel' : '';

        var deleting = (this.state.deleting) ? " LoadingCover-anim" : "";
        var deleteMsg = (this.props.user && this.props.user.type === "ADMN" && this.props.user.id !== post.idUser) ? "Delete As Admin" : "Delete";
        var deleteMsg;
        if (this.props.user && this.props.user.type === "ADMN") deleteMsg = "Delete As Admin";
        if (this.props.user && this.props.user.id === this.props.opid) deleteMsg = "Delete As OP";
        if (this.props.user && this.props.user.id === post.idUser) deleteMsg = "Delete";
        const deleteReply = (post.status !== 'DELE' && this.props.user &&
        (this.props.user.id === post.idUser || this.props.user.type === 'ADMN' || this.props.user.id === this.props.opid) && this.props.user.type !== "BAN") ? (
            <div className='Post-delete' onClick={this.delete} title='Delete Reply'>
                <div className={'LoadingCover' + deleting}></div>
                {deleteMsg}
            </div>
        ) : null;

        const reportReply = (post.status !== 'DELE' && this.props.user && this.props.user.id !== post.idUser && this.props.user.type !== 'ADMN' && this.props.user.type !== 'BAN') ? (
            <div className='Post-delete' title='Report Reply' onClick={() => this.report()}>Report</div>
        ) : null;

        var collapse = null;
        if (this.props.reply && this.state.replies.length > 0) {
            collapse = (this.state.collapsed) ?
            <div className="Post-action" onClick={this.collapse}>Show Replies</div> :
            <div className="Post-action" onClick={this.collapse}>Hide Replies</div>
        }

        var shareMsg = (this.state.share) ? "Copied" : "Share";
        var copied = (this.state.share) ? " Post-copied" : "";
        var share = <div className={'Post-action' + copied} onClick={ !this.state.share ? this.share : undefined }>{shareMsg}</div>;
        if (this.state.shareUrl) share = <div className='Post-action' onClick={() => this.setState({ shareUrl: null })}>Hide Link</div>;

        var shareUrl = (this.state.shareUrl) ? <span className='Post-shareUrl'>{this.state.shareUrl}</span> : null;

        const actions = (
            <div className='Post-actions'>
                {deleteReply}
                {reportReply}
                {collapse}
                {share}
            </div>
        )

        var collapseNo = (!this.state.collapsable) ? " PostMain-collapseNo" : "";
        var expand = (this.state.expand) ? "Show Less" : "Show More";
        var backClass = (this.state.expand) ? " PostMain-expandBack" : "";
        var collapsable = <div className={'PostMain-collapse' + collapseNo} onClick={this.state.collapsable ? this.expand : undefined} title={expand}>
            <div className={'PostMain-collapseBack' + backClass}></div>
            <span className={!this.state.expand ? 'PostMain-collapseText' : 'PostMain-expandText'}>{expand}</span>
        </div>;

        return (
            <div className={"Post" + op + opreply + youreply} id={"r" + post.id} style={{animationDelay: `${this.props.delay * 100}ms`}}>
                <div className="Post-main" id={"rMain" + post.id}>
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
                    {shareUrl}
                    {collapsable}
                </div>
                {replies}
            </div>
        );
    }
}

Reply.contextType = AppContext;
