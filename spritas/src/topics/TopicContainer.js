import './TopicContainer.css';
import TopicPortal from './TopicPortal';
import Topic from './Topic';
import React from 'react';

export default class Container extends React.Component {
    constructor(props) {
        super(props);
        this.scrollTo = this.scrollTo.bind(this);
        this.state = {
            topics: null
        }
    }

    componentDidMount() {
        var con = document.getElementById('TopicPortal-top');
        var naviTime = false;
        var prevScroll = con.scrollTop;
        con.onscroll = () => {
          clearTimeout(naviTime);
          naviTime = setTimeout(() => {
            var down = prevScroll < con.scrollTop;
            this.props.naviHide(down);
            prevScroll = con.scrollTop;
          }, 50);
        }

        fetch("/home")
            .then(res => res.json())
            .then(data => { this.setState({ topics: data }); });
    }

    scrollTo() {
        var con = document.getElementById('topics');
        con.scrollIntoView({ behavior: "smooth" });
        // if (window.location.hash !== "#topics") window.history.pushState({}, "", "#topics");
    }

    render() {
        var controls = [];
        if (this.props.user && this.props.user.type === "ADMN") {
            controls.push(<a className="TopicPortal-control-item" href={`/create/topic`} key="0">Create Root Topic</a>);
        }

        const topics = (this.state.topics) ? this.state.topics.map((topic, index) =>
            <Topic key={index} topic={topic}
                user={this.props.user} postClick={this.props.postClick} />) : null;

        return (
            <div id="topics" className="Container">
                <div className="Container-header" onClick={this.scrollTo}>
                    <h1 className="Container-title">All Posts</h1>
                </div>
                <TopicPortal topics={topics} controls={controls} top={true} />
            </div>
        );
    }
}
