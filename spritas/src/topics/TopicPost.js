import './TopicPost.css';
import pfp from '../images/pfp.png';
import React from 'react';
import he from 'he';
import * as Regex from '../functions/constants';
import relativeTime from '../functions/relativeTime';

export default class TopicPost extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state = {
            toggleTime: false
        }
    }

    handleClick(e) {
        if (e.target.className !== 'TopicPost-user' &&
        e.target.className !== 'TopicPost-img' &&
        e.target.className !== 'TopicPost-nickname') {
            e.preventDefault();
            if (e.target.className !== 'TopicPost-ts') this.props.postClick(this.props.post.id);
        }
    }

    render() {
        const post = this.props.post;
        const title = he.decode(post.title);
        const subtitle = (post.subtitle) ? (<h4 className="TopicPost-subtitle">{he.decode(post.subtitle)}</h4>) : null;
        const avatar = (post.avatar) ? `/media/avatars/${post.avatar}` : pfp;

        var ts = new Date(post.ts);
        var relTime = relativeTime(post.ts);
        ts = `Posted ${('0' + ts.getHours()).slice(-2)}:${('0' + ts.getMinutes()).slice(-2)} on ${ts.toDateString()}`;
        if (post.status === 'UPDT') {
            var tsUpdate = new Date(post.tsUpdate);
            var lastRelTime = relativeTime(post.tsUpdate);
            ts = `Updated ${('0' + tsUpdate.getHours()).slice(-2)}:${('0' + tsUpdate.getMinutes()).slice(-2)} on ${tsUpdate.toDateString()}`
            relTime = `Updated ${lastRelTime}`;
        } else relTime = `Posted ${relTime}`;

        const time = (!this.state.toggleTime) ?
        <p className="TopicPost-ts" title={ts} onClick={() => this.setState({ toggleTime: true})}>{relTime}</p> :
        <p className="TopicPost-ts" title={relTime} onClick={() => this.setState({ toggleTime: false})}>{ts}</p>;

        var thumb;
        switch(post.type) {
            case 'VIDO':
                const re_vid = new RegExp(Regex.regex_video);
                const link_vid = he.decode(post.link);
                if (post.link && re_vid.test(link_vid)) {
                    const matches = link_vid.match(Regex.regex_video).groups;
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
                        if (source === "youtube" || source === "youtu.be") embedSrc = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
                        else if (source === "streamable") embedSrc = `https://thumbs-east.streamable.com/image/${id}.jpg?height=300`;
                        const style = { backgroundImage: `url(${embedSrc})` };
                        thumb = <div className="TopicPost-thumb" style={style} />;
                    }
                } else if (post.link) {
                    // let thumbnail load
                    var currentTime = new Date();
                    var postedTime = new Date(post.tsUpdate);
                    var elapsed = currentTime - postedTime;
                    var seconds = 5 * 1000;

                    const link_img = he.decode(post.link);
                    const dot = post.link.lastIndexOf('.');
                    const embedSrc = link_img.slice(0, dot) + 'm' + link_img.slice(dot);
                    const style = { backgroundImage: `url(${embedSrc})` };

                    if (elapsed > seconds) {
                        thumb = <div className='TopicPost-thumb' style={style} />;
                    } else {
                        thumb = <div className='TopicPost-thumb TopicPost-thumbAni'></div>;
                        setTimeout(() => {
                            this.forceUpdate();
                        }, seconds + 1000);
                    }
                } else {
                    thumb = <div className='TopicPost-thumb TopicPost-thumbAni'></div>;
                }
                break;

            case 'IMG':
                if (post.link) {
                    // let thumbnail load
                    var currentTime = new Date();
                    var postedTime = new Date(post.tsUpdate);
                    var elapsed = currentTime - postedTime;
                    var seconds = 5 * 1000;

                    const link_img = he.decode(post.link);
                    const dot = post.link.lastIndexOf('.');
                    const embedSrc = link_img.slice(0, dot) + 'm' + link_img.slice(dot);
                    const style = { backgroundImage: `url(${embedSrc})` };

                    if (elapsed > seconds) {
                        thumb = <div className='TopicPost-thumb' style={style} />;
                    } else {
                        thumb = <div className='TopicPost-thumb TopicPost-thumbAni'></div>;
                        setTimeout(() => {
                            this.forceUpdate();
                        }, seconds + 1000);
                    }
                } else {
                    thumb = <div className='TopicPost-thumb TopicPost-thumbAni'></div>;
                }
                break;

            default:
                break;
        }

        return (
            <div className="TopicPost" title={title} style={{animationDelay: `${this.props.delay * 25}ms`}}>
                <a className="TopicPost-link" href={'/post/' + post.id} onClick={this.handleClick}>
                    {thumb}
                    <h3 className="TopicPost-title" id={"TopicPostName-" + post.id}>{title}</h3>
                    {subtitle}
                    <a href={`/u/${post.username}`} title={post.username}
                    className="TopicPost-a">
                        <div className="TopicPost-user">
                            <img className="TopicPost-img" src={avatar}
                            alt="Topic icon" />
                            <p className="TopicPost-nickname">{post.nickname}</p>
                        </div>
                    </a>
                    {time}
                </a>
            </div>
        );
    }
}