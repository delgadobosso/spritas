import React from 'react';
import './AuditItem.css';
import he from 'he';
import relativeTime from '../functions/relativeTime';

export default class AuditItem extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state = {
            toggleTime: false
        }
    }

    handleClick(e) {
        e.preventDefault();

        const item = this.props.item;
        this.props.postClick(item.idContent);
    }

    render() {
        const item = this.props.item;
        var result;

        var ts = new Date(item.ts);
        ts = `${('0' + ts.getHours()).slice(-2)}:${('0' + ts.getMinutes()).slice(-2)} on ${ts.toDateString()}`;
        var relTime = relativeTime(item.ts);

        const time = (!this.state.toggleTime) ?
        <span title={ts} >{relTime}</span> :
        <span title={relTime}>{ts}</span>;

        switch(item.type) {
            case 'RP':
                result = (
                    <span>
                        <a href={`/u/${item.usernameFrom}`}>{`${item.nicknameFrom} (@${item.usernameFrom})`}</a>&nbsp;
                        <span>reported&nbsp;
                        <a href={`/post/${item.idContent}`} onClick={this.handleClick}>{`post#${item.idContent}`}</a>&nbsp;</span>
                        <span>by&nbsp;
                        <a href={`/u/${item.usernameTo}`}>{`${item.nicknameTo} (@${item.usernameTo})`}</a></span>
                        <br /><br /><span className='AuditItem-ts' onClick={() => this.setState(state => ({ toggleTime: !state.toggleTime }))}>{time}</span>
                    </span>
                );
                break;

            default:
                break;
        }

        return (
            <tr className='AuditItem'>
                <td className='AuditItem-td'>{result}</td>
                <td className='AuditItem-td'>{he.decode(item.reason)}</td>
            </tr>
        )
    }
}