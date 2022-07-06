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
                        <a href={`/u/${item.usernameFrom}`}>{`@${item.usernameFrom}`}</a>
                        &nbsp;reported&nbsp;
                        <a href={`/post/${item.idContent}`} onClick={this.handleClick}>{`P${item.idContent}`}</a>
                        &nbsp;posted by&nbsp;
                        <a href={`/u/${item.usernameTo}`}>{`@${item.usernameTo}`}</a>
                    </span>
                );
                break;

            default:
                break;
        }

        return (
            <tr className='AuditItem'>
                <td className='AuditItem-td'>{result}</td>
                <td className='AuditItem-td'>{item.reason}</td>
                <td className='AuditItem-td'>{item.ts}</td>
            </tr>
        )
    }
}