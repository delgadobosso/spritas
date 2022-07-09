import './Post.css';
import React from 'react';
import he from 'he';
import { regex_video } from '../functions/constants';
import PostModal from './PostModal';
import pfp from '../images/pfp.png';
import relativeTime from '../functions/relativeTime';
import PureIframe from '../other/PureIframe';
import CreatePost from '../create/CreatePost';

export default class Post extends React.Component {
    constructor(props) {
        super(props);
        this.hashHandle = this.hashHandle.bind(this);
        this.resizeHandle = this.resizeHandle.bind(this);
        this.left = this.left.bind(this);
        this.right = this.right.bind(this);
        this.goToPost = this.goToPost.bind(this);
        this.postTransition = this.postTransition.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.delete = this.delete.bind(this);
        this.report = this.report.bind(this);
        this.collapsable = this.collapsable.bind(this);
        this.expand = this.expand.bind(this);
        this.updateMode = this.updateMode.bind(this);
        this.share = this.share.bind(this);
        this.state = ({
            modal: false,
            toggleTime: false,
            updateMode: false,
            fromIndex: this.props.current - 1,
            collapsable: false,
            expand: false,
            resize: true,
            share: false,
            shareUrl: null
        });
    }

    componentDidMount() {
        window.addEventListener('hashchange', this.hashHandle);
        window.addEventListener('resize', this.resizeHandle);

        this.collapsable();
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.hashHandle);
        window.removeEventListener('resize', this.resizeHandle);
    }

    hashHandle(e) {
        if (e.oldURL.split('#')[1] === `image${this.props.current}`) {
            const modal = document.getElementById('PostModal-' + this.props.posts[this.props.current - 1].id);
            modal.style.opacity = 0;
            const controller = new AbortController();
            modal.addEventListener('transitionend', (e) => {
                if (e.currentTarget === e.target) {
                    this.setState({
                        modal: false
                    }, () => this.props.naviHide(false));
                    controller.abort();
                }
            }, { signal: controller.signal });
        } else if (e.newURL.split('#')[1] === `image${this.props.current}`) {
            this.setState({
                modal: true
            }, () => this.props.naviHide(true));
        }
    }

    resizeHandle() {
        // Throttle resize handle
        if (this.state.resize) {
            this.setState({ resize: false });
            setTimeout(() => this.setState({ resize: true }, () => this.collapsable()), 500);
        }
    }

    left() {
        const posts = this.props.posts;
        const currentPost = posts[this.props.current - 1];

        if (this.props.current > 1 && !this.state.updateMode) {
            const fromHeight = document.getElementById(`PostMain-post${currentPost.id}`).clientHeight;
            this.props.setCurrent(this.props.current - 1, (newIndex) => {
                this.postTransition(fromHeight, newIndex);
            });
        }
    }

    right() {
        const posts = this.props.posts;
        const currentPost = posts[this.props.current - 1];

        if (this.props.current < this.props.posts.length && !this.state.updateMode) {
            const fromHeight = document.getElementById(`PostMain-post${currentPost.id}`).clientHeight;
            this.props.setCurrent(this.props.current + 1, (newIndex) => {
                this.postTransition(fromHeight, newIndex);
            });
        }
    }

    goToPost(index) {
        const posts = this.props.posts;
        const currentPost = posts[this.props.current - 1];

        if (this.props.current !== index && !this.state.updateMode) {
            const fromHeight = document.getElementById(`PostMain-post${currentPost.id}`).clientHeight;
            this.props.setCurrent(index, (newIndex) => {
                this.postTransition(fromHeight, newIndex);
            });
        }
    }

    postTransition(fromHeight, newIndex) {
        this.setState({ shareUrl: null });
        this.collapsable();
        const posts = this.props.posts;
        const newPost = posts[newIndex - 1];
        const postTo = document.getElementById(`PostMain-post${newPost.id}`);
        const subtitle = document.getElementById(`PostMain-subtitle${newPost.id}`);
        const body = document.getElementById(`PostMain-body${newPost.id}`);
        const media = document.getElementById(`PostMain-media${newPost.id}`);
        const options = { duration: 500, easing: 'ease' };
        postTo.getAnimations().map(animation => animation.cancel());
        postTo.animate([
            { height: `${fromHeight}px` },
            { height: `${postTo.clientHeight}px` }
        ], options);
        const fadeIn = [{ opacity: 0 }, { opacity: 1 }];
        if (subtitle) subtitle.animate(fadeIn, options);
        if (body) body.animate(fadeIn, options);
        if (media) media.animate(fadeIn, options);
    }

    toggleModal() {
        this.setState(state => ({
            modal: !state.modal
        }), () => {
            if (this.state.modal) {
                this.props.naviHide(true);
                var prevState = window.history.state;
                window.history.pushState(prevState, "", `#image${this.props.current}`);
                window.history.scrollRestoration = 'manual';
            } else if (!this.state.modal) {
                this.props.naviHide(false);
                window.history.go(-1);
            }
        });
    }

    delete(post) {
        var answer = prompt(`Are you sure you want to delete this post?\nType "${post.title}" to confirm:`, '');
        if (answer === post.title) {
            var reason = prompt(`Why are you deleting this post?`, '');
            if (reason) {
                var myBody = new URLSearchParams();
                myBody.append('currentid', post.id);
                myBody.append('reason', reason);

                fetch('/delete/post', {
                    method: 'POST',
                    body: myBody
                })
                .then((resp) => {
                    if (resp.ok) window.location.href = '/';
                    else console.error('Post deletion error');
                });
            } else if (reason === '') alert(`You must give a reason to delete this post.`);
        } else if (answer !== null) alert(`Value incorrect. Post not deleted.`);
    }

    report(post) {
        var answer = prompt(`Why are you reporting this post?`, '');
        if (answer) {
            var myBody = new URLSearchParams();
            myBody.append('id', post.id);
            myBody.append('reason', answer);

            fetch('/report/post', {
                method: 'POST',
                body: myBody
            })
            .then((resp) => {
                if (resp.ok) alert('This post has been reported to the Admins.');
                else alert('Error reporting post. Please try again or reach out directly to an Admin.');
            });
        } else if (answer === '') alert(`You must give a reason to report this post.`);
    }

    collapsable(newIndex) {
        const posts = this.props.posts;
        const currentPost = (newIndex) ? posts[newIndex - 1] : posts[this.props.current - 1];
        const post = document.getElementById(`PostMain-post${currentPost.id}`);
        if (post) {
            post.getAnimations().map(animation => animation.cancel());
            post.style.height = 'initial';
        }
        if (post && post.scrollHeight > 675) {
            post.style.height = '675px';
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
        const posts = this.props.posts;
        const currentPost = posts[this.props.current - 1];
        const post = document.getElementById(`PostMain-post${currentPost.id}`);
        const durr = (post.scrollHeight > 1000) ? 1000 : 500;

        if (!this.state.expand) this.setState({
            expand: true
        }, () => {
            post.getAnimations().map(animation => animation.cancel());
            post.animate([
                { height: `675px` },
                { height: `${post.scrollHeight + 35}px` }
            ], { duration: durr, easing: 'ease' });
            post.style.height = `${post.scrollHeight + 35}px`;
        });
        else this.setState({
            expand: false
        }, () => {
            this.props.scrollTop();
            post.getAnimations().map(animation => animation.cancel());
            post.animate([
                { height: `${post.scrollHeight}px` },
                { height: `675px` },
            ], { duration: durr, easing: 'ease' });
            post.style.height = `675px`;
        });
    }

    updateMode(yes) {
        const posts = this.props.posts;
        const currentPost = posts[this.props.current - 1];

        if (yes) {
            var currentHeight = document.getElementById(`PostMain-post${currentPost.id}`).clientHeight;
            if (currentHeight) this.setState({ height: currentHeight });
            this.setState({
                updateMode: true,
                fromIndex: this.props.current - 1,
                shareUrl: null
            }, () => setTimeout(() => this.props.setCurrent(this.props.posts.length), 10));
        } else {
            this.setState({
                updateMode: false,
                expand: false
            }, () => {
                this.collapsable();
                const con = document.getElementById(`PostMain-mediaContainer${currentPost.id}`);
                const cards = document.getElementById(`PostMain-cards${currentPost.id}`);
                const vid = document.getElementById(`PostMain-media${currentPost.id}`);
                con.classList.add('PostMain-return');
                cards.classList.add('PostMain-returnCards');
                if (vid) vid.classList.add('PostMain-return');
                setTimeout(() => {
                    con.classList.remove('PostMain-return');
                    cards.classList.remove('PostMain-returnCards');
                    if (vid) vid.classList.remove('PostMain-return');
                }, 10);
                const postCard = document.getElementById(`PostMain-post${currentPost.id}`);
                postCard.animate([
                    { height: '380px' },
                    { height: `${postCard.clientHeight}px` }
                ], { duration: 500, easing: 'ease' });
                this.props.extendReplies(true);
            });
        }
    }

    share() {
        const posts = this.props.posts;
        const currentPost = posts[this.props.current - 1];
        var url = (window.location.port) ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}` :
        `${window.location.protocol}//${window.location.hostname}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(`${url}/p/${currentPost.id}`)
            .then(() => {
                this.setState({
                    share: true
                }, () => setTimeout(() => this.setState({ share: false }), 3000));
            }, (reason) => console.error(reason));
        } else this.setState({ shareUrl: `${url}/p/${currentPost.id}` });
    }

    render() {
        const posts = this.props.posts;
        const length = posts.length;
        const currentPost = posts[this.props.current - 1];

        var ts = new Date(currentPost.ts);
        var relTime = relativeTime(currentPost.ts);
        ts = `${('0' + ts.getHours()).slice(-2)}:${('0' + ts.getMinutes()).slice(-2)} on ${ts.toDateString()}`;

        const time = (!this.state.toggleTime) ?
        <p className="PostMain-ts" title={ts} onClick={() => this.setState({ toggleTime: true})}>{relTime}</p> :
        <p className="PostMain-ts" title={relTime} onClick={() => this.setState({ toggleTime: false})}>{ts}</p>;

        // Update controls
        if (length > 1) {
            const nodes = posts.map((post, index) => {
                var fill, r, nClass;
                if (this.props.current - 1 === index) {
                    fill = 'var(--spritan-gold)';
                    r = '15';
                    nClass = 'PostMain-nodeCurrent';
                } else {
                    fill = 'var(--darkest-grey)';
                    r = '8';
                    nClass = 'PostMain-node'
                }

                var currentTs = new Date(post.ts);
                var currentRelTime = relativeTime(post.ts);
                currentTs = `${('0' + currentTs.getHours()).slice(-2)}:${('0' + currentTs.getMinutes()).slice(-2)} on ${currentTs.toDateString()}`;

                const subtitle = (post.subtitle) ? `"${he.decode(post.subtitle)}" ` : "";
                const nodeTime = (!this.state.toggleTime) ? currentRelTime : currentTs;

                return (
                    <g key={index} className="PostMain-nodeHit"
                        onClick={() => this.goToPost(index + 1)}>
                        <circle cx={60 * index} cy='50%' r='25' fillOpacity='0' />
                        <circle className={nClass}
                            cx={60 * index} cy='50%' r={r} fill={fill} />
                        <title>{`${subtitle}${nodeTime}`}</title>
                    </g>
                )
            });

            const nodeStyle = { transform: `translate(-${60 * (this.props.current - 1)}px)` };
            var classNotEndL = ' PostMain-notEnd';
            var classNotEndR = ' PostMain-notEnd';
            var leftArrow = 'white'
            var rightArrow = 'white'
            if (this.props.current === 1 || this.state.updateMode) {
                leftArrow = 'var(--darkest-grey)';
                classNotEndL = '';
            }
            if (this.props.current === length || this.state.updateMode) {
                rightArrow = 'var(--darkest-grey)';
                classNotEndR = '';
            }

            var newestIndex = posts.length;
            var updateBegin = (this.state.updateMode) ? <animate id='grow' attributeName='r' values='0;13' dur='1s' calcMode='spline' keyTimes='0; 1' keySplines='0.33, 1, 0.68, 1' /> : null;
            var updateClass = (this.state.updateMode) ? 'PostMain-updateNode' : "";
            var updateNode =  (
                <g key={newestIndex}>
                    <circle className={updateClass}
                    cx={60 * newestIndex} cy='50%' r='0'>
                        {updateBegin}
                        <animate attributeName='r' values='13;8;13' begin='grow.end' dur='2s' repeatCount='indefinite'
                        calcMode='spline' keyTimes='0; 0.5; 1' keySplines='0.65, 0, 0.35, 1; 0.65, 0, 0.35, 1' />
                    </circle>
                    <title>Update Post</title>
                </g>
            );
            var updateLine = (this.state.updateMode) ? (
                <line x1={60 * (length - 1)} y1='50%' x2={60 * length} y2='50%' stroke='var(--darkest-grey)' strokeWidth='3px'>
                    <animate attributeName='x2' values={`${60 * (length - 1)};${60 * length}`} dur='1s' calcMode='spline' keyTimes='0; 1' keySplines='0.33, 1, 0.68, 1' />
                </line>
            ) : null;

            var controls = (
                <div className="PostMain-controls">
                    <svg className={"PostMain-arrowContainer" + classNotEndL} xmlns="http://www.w3.org/2000/svg" 
                        viewBox='0 0 80 40' onClick={this.left}>
                        <title>Previous Update</title>
                        <path className='PostMain-arrowL' d='M 40 10 L 30 20 L 40 30'
                            stroke={leftArrow} strokeWidth='5px' strokeLinecap='round' strokeLinejoin='round'
                            fill='none' />
                    </svg>

                    <svg className='PostMain-update' xmlns="http://www.w3.org/2000/svg">
                        <svg overflow='visible' x='50%'>
                            <g className='PostMain-nodeContainer' style={nodeStyle}>
                                <line x1='0' y1='50%' x2={60 * (length - 1)} y2='50%'
                                    stroke='var(--darkest-grey)' strokeWidth='3px' />
                                {updateLine}
                                {nodes}
                                {updateNode}
                            </g>
                        </svg>
                    </svg>

                    <svg className={"PostMain-arrowContainer" + classNotEndR} xmlns="http://www.w3.org/2000/svg" 
                        viewBox='0 0 80 40' onClick={this.right}>
                        <title>Next Update</title>
                        <path className='PostMain-arrowR' d='M 35 10 L 45 20 L 35 30'
                            stroke={rightArrow} strokeWidth='5px' strokeLinecap='round' strokeLinejoin='round'
                            fill='none' />
                    </svg>
                </div>
            )
        }

        var modal;
        var video;
        var image;
        var cardsClass = "";
        var mediaClass = "";
        switch(currentPost.type) {
            case "TEXT":
                cardsClass = " PostMain-cardsText";
                mediaClass = " PostMain-mediaText";
                break;

            case "VIDO":
                const re = new RegExp(regex_video);
                const link = he.decode(currentPost.link);
                if (currentPost.link && re.test(link)) {
                    const matches = link.match(regex_video).groups;
                    var source;
                    for (const thisSrc in matches) {
                        if (thisSrc.includes('source') && matches[thisSrc]) source = matches[thisSrc];
                    }
                    var id;
                    for (const thisId in matches) {
                        if (thisId.includes('id') && matches[thisId]) id = matches[thisId];
                    }
                    if (id) {
                        var embedSrc;
                        if (source === "youtube" || source === "youtu.be") embedSrc = `https://www.youtube.com/embed/${id}?modestbranding=1`;
                        else if (source === "streamable") embedSrc = `https://streamable.com/e/${id}`;
                        video = (
                            <PureIframe src={embedSrc} width="100%" height="675" id={currentPost.id} elementId={`PostMain-media${currentPost.id}`} />
                        );
                    }
                } else if (currentPost.link) {
                    video = (
                        <video id={`PostMain-media${currentPost.id}`} className='PostMain-videoElem' src={link} controls></video>
                    )
                }
                break;

            case "IMG":
                if (currentPost.link) {
                    modal = (this.state.modal) ? 
                        <PostModal link={currentPost.link} id={currentPost.id}/>
                        : null;

                    image = (
                        <div className='PostMain-imageContainer'
                            onClick={this.toggleModal}>
                            <img id={`PostMain-media${currentPost.id}`} className='PostMain-image'
                                src={currentPost.link} key={currentPost.link}
                                alt="Main Post" />
                            <p className='PostMain-view'>Click To View Full Image</p>
                        </div>);
                }
                break;

            default:
                break;
        }

        var media = (
            <div id={`PostMain-mediaContainer${currentPost.id}`} className={'PostMain-mediaContainer' + mediaClass}>
                {video}
                {image}
            </div>
        )

        const avatar = (currentPost.avatar) ? `/media/avatars/${currentPost.avatar}` : pfp;
        const subtitle = (currentPost.subtitle) ?
            <h3 id={`PostMain-subtitle${currentPost.id}`} className='PostMain-subtitle'>{he.decode(currentPost.subtitle)}</h3> : null;

        var collapseNo = (!this.state.collapsable) ? " PostMain-collapseNo" : "";
        var expand = (this.state.expand) ? "Show Less" : "Show More";
        var backClass = (this.state.expand) ? " PostMain-expandBack" : "";
        var collapsable = <div className={'PostMain-collapse' + collapseNo} onClick={this.state.collapsable ? this.expand : undefined} title={expand}>
            <div className={'PostMain-collapseBack' + backClass}></div>
            <span className={!this.state.expand ? 'PostMain-collapseText' : 'PostMain-expandText'}>{expand}</span>
        </div>;

        var update;
        var deletePost;
        var report;
        if (this.props.user && this.props.user.id === currentPost.idUser && currentPost.status !== 'DELE' && this.props.user.type !== 'BAN') {
            update = (!this.props.oneReply) ? <div className='PostMain-optionItem' onClick={() => this.updateMode(true)}>Update Post</div> : null;
            deletePost = <div className='PostMain-optionItem PostMain-optionItemRed' onClick={() => this.delete(currentPost)}>Delete Post</div>;
        } else if (this.props.user && this.props.user.type === 'ADMN' && currentPost.status !== 'DELE') {
            deletePost = <div className='PostMain-optionItem PostMain-optionItemRed' onClick={() => this.delete(currentPost)}>Delete Post As Admin</div>;
        } else if (this.props.user && this.props.user.type !== 'BAN') {
            report = <div className='PostMain-optionItem PostMain-optionItemRed' onClick={() => this.report(currentPost)}>Report Post</div>;
        }
        var shareMsg = (this.state.share) ? "Copied" : "Share Post";
        var copied = (this.state.share) ? " PostMain-copied" : "";
        var share = <div className={'PostMain-optionItem' + copied} onClick={ !this.state.share ? this.share : undefined }>{shareMsg}</div>
        if (this.state.shareUrl) share = <div className='PostMain-optionItem' onClick={() => this.setState({ shareUrl: null })}>Hide Link</div>;

        var shareUrl = (this.state.shareUrl) ? <span className='Post-shareUrl'>{this.state.shareUrl}</span> : null;

        const options = (update || deletePost || report || share) ? (
            <div className='PostMain-option'>
                {update}
                {share}
                {shareUrl}
                {deletePost}
                {report}
            </div>
        ) : null;

        var currentMode = (!this.state.updateMode) ? (
            <div>
                {modal}
                <div className='PostMain-container'>
                    {media}
                    <div id={`PostMain-cards${currentPost.id}`} className={"PostMain-cards" + cardsClass}>
                        <div className="PostMain-postOption">
                            <div id={`PostMain-post${currentPost.id}`} className='PostMain-post'>
                                <h2 className='PostMain-title'>{he.decode(currentPost.title)}</h2>
                                <div className='PostMain-info'>
                                    <a href={`/u/${currentPost.username}`} title={'@' + currentPost.username}
                                    className="PostMain-a">
                                        <div className="PostMain-user">
                                            <img className="PostMain-img" src={avatar}
                                            alt="Topic icon" />
                                            <p className="PostMain-nickname">{currentPost.nickname}</p>
                                        </div>
                                    </a>
                                    {time}
                                </div>
                                {controls}
                                {subtitle}
                                <div id={`PostMain-body${currentPost.id}`} className='PostMain-body'>{he.decode(currentPost.body)}</div>
                                {collapsable}
                            </div>
                            {options}
                        </div>
                        {this.props.rest}
                    </div>
                </div>
            </div>
        ) : (
            <div>
                <CreatePost user={this.props.user} ogPost={posts[0]} fromPost={posts[this.state.fromIndex]} currentPost={currentPost} controls={controls} updateMode={this.updateMode} height={this.state.height} ogId={this.props.posts[0].id} />
            </div>
        );

        return (
            <div className="PostMain">
                {currentMode}
            </div>
        )
    }
}