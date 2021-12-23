import './TopicPost.css';
import pfp from '../images/pfp.png';
import React from 'react';
import he from 'he';
import { regex_video } from '../functions/constants';

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
        if (post.type === "VIDO") {
            const re = new RegExp(regex_video);
            const link = he.decode(post.link);
            if (post.link && re.test(link)) {
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
                    if (source === "youtube" || source === "youtu.be") embedSrc = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
                    else if (source === "streamable") embedSrc = `https://thumbs-east.streamable.com/image/${id}.jpg?height=300`;
                    thumb = 
                    <img className="TopicPost-thumb" alt="Thumbnail"
                        src={embedSrc} />;
                }
            }
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
                    {thumb}
                </a>
            </div>
        );
    }
}