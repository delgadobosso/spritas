import './PostMain.css';
import React from 'react';
import Post from './Post';
import he from 'he';
import { regex_video } from '../functions/constants';
import PostModal from './PostModal';
import pfp from '../images/pfp.png';
import relativeTime from '../functions/relativeTime';
import PureIframe from '../other/PureIframe';

export default class PostMain extends React.Component {
    constructor(props) {
        super(props);
        this.hashHandle = this.hashHandle.bind(this);
        this.left = this.left.bind(this);
        this.right = this.right.bind(this);
        this.goToPost = this.goToPost.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.delete = this.delete.bind(this);
        this.state = ({
            modal: false,
            toggleTime: false
        });
    }

    componentDidMount() {
        window.addEventListener('hashchange', this.hashHandle);
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.hashHandle);
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

    left() {
        if (this.props.current > 1) {
            this.props.setCurrent(this.props.current - 1);
        }
    }

    right() {
        if (this.props.current < this.props.posts.length) {
            this.props.setCurrent(this.props.current + 1);
        }
    }

    goToPost(index) {
        if (this.props.current !== index) this.props.setCurrent(index);
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
            var myBody = new URLSearchParams();
            myBody.append('ogid', this.props.posts[0].id);
            myBody.append('currentid', post.id);

            fetch('/delete/post', {
                method: 'POST',
                body: myBody
            })
            .then((resp) => {
                if (resp.ok) window.location.href = '/';
                else console.error('Post deletion error');
            });
        } else if (answer !== null) alert(`Value incorrect. Post not deleted.`);
    }

    render() {
        const posts = this.props.posts;
        const length = posts.length;
        const currentPost = posts[this.props.current - 1];
        const currentElem = <Post post={currentPost} op={true} />;

        var ts = new Date(currentPost.ts);
        var relTime = relativeTime(currentPost.ts);
        ts = `${('0' + ts.getHours()).slice(-2)}:${('0' + ts.getMinutes()).slice(-2)} on ${ts.toDateString()}`;
        relTime = `${relTime}`;

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

                const nodeTime = (!this.state.toggleTime) ? relTime : ts;

                return (
                    <g key={index} className='PostMain-nodeHit'
                        onClick={() => this.goToPost(index + 1)}>
                        <circle cx={60 * index} cy='50%' r='25' fillOpacity='0' />
                        <circle className={nClass}
                            cx={60 * index} cy='50%' r={r} fill={fill} />
                        <title>{`"${post.subtitle}" ${nodeTime}`}</title>
                    </g>
                )
            });

            const nodeStyle = { transform: `translate(-${60 * (this.props.current - 1)}px)` };
            var classNotEndL = ' PostMain-notEnd';
            var classNotEndR = ' PostMain-notEnd';
            var leftArrow = 'white'
            var rightArrow = 'white'
            if (this.props.current === 1) {
                leftArrow = 'var(--darkest-grey)';
                classNotEndL = '';
            }
            if (this.props.current === length) {
                rightArrow = 'var(--darkest-grey)';
                classNotEndR = '';
            }

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
                                {nodes}
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
        var media;
        var cardsClass = "";
        var postOpClass = ""
        switch(currentPost.type) {
            case "TEXT":
                cardsClass = " PostMain-cardsText";
                postOpClass = " PostMain-postOptionText";
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
                        <div className="PostMain-mediaContainer">
                            <PureIframe src={embedSrc} width="100%" height="675" id={currentPost.id} />
                        </div>);
                    }
                } else if (currentPost.link) {
                    video = (
                        <div className='PostMain-mediaContainer'>
                            <video className='PostMain-videoElem' src={link} controls width="100%"></video>
                        </div>
                    )
                }
                media = video;
                break;

            case "IMG":
                if (currentPost.link) {
                    modal = (this.state.modal) ? 
                        <PostModal link={currentPost.link} id={currentPost.id}/>
                        : null;

                    image =
                    <div className='PostMain-mediaContainer'>
                        <div className='PostMain-imageContainer'
                            onClick={this.toggleModal}>
                            <img className='PostMain-image'
                                src={currentPost.link}
                                alt="Main Post" />
                            <p className='PostMain-view'>Click To View Full Image</p>
                        </div>
                    </div>
                }
                media = image;
                break;

            default:
                break;
        }

        const avatar = (currentPost.avatar) ? `/media/avatars/${currentPost.avatar}` : pfp;
        const subtitle = (currentPost.subtitle) ?
            <h4 className='PostMain-subtitle'>{he.decode(currentPost.subtitle)}</h4> : null;

        var update;
        var deletePost;
        var report;
        if (this.props.user && this.props.user.id === currentPost.idUser && currentPost.update !== 'DELE' && this.props.user.type !== 'BAN') {
            update = <div className='PostMain-optionItem'>Update Post</div>;
            deletePost = <div className='PostMain-optionItem PostMain-optionItemRed' onClick={() => this.delete(currentPost)}>Delete Post</div>;
        } else if (this.props.user && this.props.user.type === 'ADMN' && currentPost.update !== 'DELE') {
            deletePost = <div className='PostMain-optionItem PostMain-optionItemRed' onClick={() => this.delete(currentPost)}>Delete Post As Admin</div>;
        } else if (this.props.user && this.props.user.type !== 'BAN') {
            report = <div className='PostMain-optionItem PostMain-optionItemRed'>Report Post</div>;
        }

        const options = (update || deletePost || report) ? (
            <div className='PostMain-option'>
                {update}
                {deletePost}
                {report}
            </div>
        ) : null;

        return (
            <div className={"PostMain"}>
                {modal}
                <div className='PostMain-container'>
                    {media}
                    <div className={"PostMain-cards" + cardsClass}>
                        <div className={"PostMain-postOption" + postOpClass}>
                            <div className='PostMain-post'>
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
                                <div className='PostMain-body'>{he.decode(currentPost.body)}</div>
                            </div>
                            {options}
                        </div>
                        {this.props.rest}
                    </div>
                </div>
            </div>
        )
    }
}