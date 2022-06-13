import './TopicContainer.css';
import Topic from './Topic';
import React from 'react';

export default class TopicContainer extends React.Component {
    constructor(props) {
        super(props);
        this.scrollTo = this.scrollTo.bind(this);
    }

    scrollTo() {
        var con = document.getElementById(`TopicContainer-${this.props.topic.id}`);
        con.scrollIntoView({ behavior: "smooth" });
        // if (window.location.hash !== "#topics") window.history.pushState({}, "", "#topics");
    }

    render() {
        return (
            <div id={`TopicContainer-${this.props.topic.id}`} className="Container">
                <div className="Container-header" onClick={this.scrollTo}>
                    <h1 className="Container-title">{this.props.topic.name}</h1>
                </div>
                <Topic topic={this.props.topic} user={this.props.user} postClick={this.props.postClick} naviHide={this.props.naviHide} />
            </div>
        );
    }
}
