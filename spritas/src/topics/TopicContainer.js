import './TopicContainer.css';
import Topic from './Topic';
import React from 'react';

export default class TopicContainer extends React.Component {
    constructor(props) {
        super(props);
        this.scrollTo = this.scrollTo.bind(this);
    }

    scrollTo() {
        var con = document.getElementById('TopicContainer');
        con.scrollIntoView({ behavior: "smooth" });
        // if (window.location.hash !== "#topics") window.history.pushState({}, "", "#topics");
    }

    render() {
        return (
            <div id='TopicContainer' className="TopicContainer">
                <div className="TopicContainer-header" onClick={this.scrollTo}>
                    <h1 className="TopicContainer-title">Posts</h1>
                </div>
                <Topic user={this.props.user} postClick={this.props.postClick} feed={"new"} />
            </div>
        );
    }
}
