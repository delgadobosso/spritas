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
    }

    handleClick(e) {
        if (e.target.className !== 'TopicPost-user' &&
        e.target.className !== 'TopicPost-img' &&
        e.target.className !== 'TopicPost-nickname') {
            e.preventDefault();
            this.props.postClick(this.props.post.id);
        }
    }

    render() {
        const post = this.props.post;
        const title = he.decode(post.title);
        const subtitle = (post.subtitle) ? (
            <div className='TopicPost-titles'>
                <h4 className="TopicPost-subName">{he.decode(post.subtitle)}</h4>
            </div>) : null;
        const avatar = (post.avatar) ? `/media/avatars/${post.avatar}` : pfp;

        var ts = new Date(post.ts);
        var relTime = relativeTime(post.ts);
        ts = `Created ${('0' + ts.getHours()).slice(-2)}:${('0' + ts.getMinutes()).slice(-2)} on ${ts.toDateString()}`;
        if (post.update === 'UPDT') {
            var lastTs = new Date(post.lastTs);
            var lastRelTime = relativeTime(post.lastTs);
            ts = `Updated ${('0' + lastTs.getHours()).slice(-2)}:${('0' + lastTs.getMinutes()).slice(-2)} on ${lastTs.toDateString()}`
            relTime = `Updated ${lastRelTime}`;
        } else relTime = `Created ${relTime}`;

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
                }
                break;

            case 'IMG':
                if (post.link) {
                    const link_img = he.decode(post.link);
                    const dot = post.link.lastIndexOf('.');
                    const embedSrc = link_img.slice(0, dot) + 'm' + link_img.slice(dot);
                    const style = { backgroundImage: `url(${embedSrc})` };
                    thumb = <div className='TopicPost-thumb' style={style} />
                }
                break;

            default:
                break;
        }

        return (
            <div className="TopicPost" title={title}>
                <a className="TopicPost-link" href={'/post/' + post.id} onClick={this.handleClick}>
                    <div className='TopicPost-titles'>
                        <h2 className="TopicPost-name" id={"TopicPostName-" + post.id}>{title}</h2>
                    </div>
                    {thumb}
                    {subtitle}
                    <a href={`/u/${post.username}`} title={post.username}>
                        <div className="TopicPost-user">
                            <img className="TopicPost-img" src={avatar}
                            alt="Topic icon" />
                            <p className="TopicPost-nickname">{post.nickname}</p>
                        </div>
                    </a>
                    <p className="TopicPost-ts" title={ts}>{relTime}</p>
                </a>
            </div>
        );
    }
}