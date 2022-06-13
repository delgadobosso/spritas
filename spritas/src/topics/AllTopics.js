import './AllTopics.css';
import TopicContainer from './TopicContainer';
import React from 'react';

export default class AllTopics extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            topics: null
        }
    }

    componentDidMount() {
        fetch("/home")
            .then(res => res.json())
            .then(data => { this.setState({ topics: data }); });
    }

    render() {
        const topicContainers = (this.state.topics) ? this.state.topics.map((topic, index) => 
            <TopicContainer key={index} topic={topic} user={this.props.user}
                postClick={this.props.postClick} naviHide={this.props.naviHide} />) : null;

        return (
            <div className='AllTopics'>
                {topicContainers}
            </div>
        )
    }
}