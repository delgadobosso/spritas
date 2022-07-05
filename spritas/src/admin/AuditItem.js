import React from 'react';
import TopicPost from '../topics/TopicPost';
import './AuditItem.css';

export default class AuditItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: null
        }
    }

    componentDidMount() {
        const item = this.props.item;

        switch(item.type) {
            case 'RP':
                fetch(`/p/${item.idContent}`)
                .then(resp => resp.json())
                .then(data => {
                    if (data) this.setState({ content: data[0] });
                });
                break;

            default:
                break;
        }
    }

    render() {
        const item = this.props.item;
        var result = [];

        switch(item.type) {
            case 'RP':
                var post = (this.state.content) ? <TopicPost post={this.state.content} postClick={this.props.postClick} /> : null;
                result.push([
                    <td>{item.idFrom}</td>,
                    <td>{item.idTo}</td>,
                    <td>{post}</td>,
                    <td>{item.type}</td>,
                    <td>{item.reason}</td>,
                    <td>{item.ts}</td>
                ])
                break;

            default:
                break;
        }

        return (
            <tr className='AuditItem'>
                {result}
            </tr>
        )
    }
}