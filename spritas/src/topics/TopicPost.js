import './TopicPost.css';
import pfp from '../images/pfp.png';
import React from 'react';
import he from 'he';
import * as Regex from '../functions/constants';

export default class TopicPost extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        e.preventDefault();

        this.props.postClick(this.props.post.id);
    }

    render() {
        const post = this.props.post;
        const title = he.decode(post.title);

        var ts = new Date(post.ts);
        ts = `Created ${('0' + ts.getHours()).slice(-2)}:${('0' + ts.getMinutes()).slice(-2)} on
        ${ts.toDateString()}`;

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
                        thumb = <img className="TopicPost-thumb" alt="Thumbnail" src={embedSrc} />;
                    }
                }
                break;

            case 'IMG':
                if (post.link) {
                    const link_img = he.decode(post.link);
                    const dot = post.link.lastIndexOf('.');
                    const embedSrc = link_img.slice(0, dot) + 'm' + link_img.slice(dot);
                    thumb = <img className='TopicPost-thumb' alt='Thumbnail' src={embedSrc} />
                }
                break;

            default:
                break;
        }

        return (
            <div className="TopicPost" title={title}>
                <a className="TopicPost-link" href={'/post/' + post.id} onClick={this.handleClick}>
                    <h2 className="TopicPost-name" id={"TopicPostName-" + post.id}>
                        {title}
                    </h2>
                    <div className="TopicPost-user">
                        <img className="TopicPost-img" src={pfp}
                            title={post.userName}
                            alt="Topic icon" />
                        <p className="TopicPost-details">
                            {post.userName} &middot; {ts}
                        </p>
                    </div>
                    <div className='TopicPost-thumbContainer'>
                        {thumb}
                    </div>
                </a>
            </div>
        );
    }
}