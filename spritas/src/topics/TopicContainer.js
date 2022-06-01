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
        var controls = [];
        // if (this.props.user && this.props.user.type === "ADMN") {
        //     controls.push(<a className="TopicPortal-control-item" href={`/create/topic`} key="0">Create Root Topic</a>);
        // }

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
