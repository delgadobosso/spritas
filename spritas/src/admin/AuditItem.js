import React from 'react';
import TopicPost from '../topics/TopicPost';
import './AuditItem.css';

export default class AuditItem extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        e.preventDefault();

        const item = this.props.item;
        this.props.postClick(item.idContent);
    }

    render() {
        const item = this.props.item;
        var result;

        switch(item.type) {
            case 'RP':
                result = (
                    <span>
                        <a href={`/u/${item.idFrom}`}>{`@${item.idFrom} `}</a>
                        reported
                        <a href={`/post/${item.idContent}`} onClick={this.handleClick}>{` P${item.idContent}`}</a>
                    </span>
                );
                break;

            default:
                break;
        }

        return (
            <tr className='AuditItem'>
                <td>{result}</td>
                <td>{item.reason}</td>
                <td>{item.ts}</td>
            </tr>
        )
    }
}