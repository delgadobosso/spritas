import React from 'react';
import './AuditItem.css';
import he from 'he';
import relativeTime from '../functions/relativeTime';

export default class AuditItem extends React.Component {
    constructor(props) {
        super(props);
        this.handlePostClick = this.handlePostClick.bind(this);
        this.handleReplyClick = this.handleReplyClick.bind(this);
        this.state = {
            toggleTime: false,
            idPost: null
        }
    }

    componentDidMount() {
        const item = this.props.item;
        if (item.type === "RR" || item.type === "DR") {
            fetch('/reply/' + item.idContent)
            .then(resp => resp.json())
            .then(data => this.setState({ idPost: data[0].idPost }));
        }
    }

    handlePostClick(e) {
        e.preventDefault();

        const item = this.props.item;
        this.props.postClick(item.idContent);
    }

    handleReplyClick(e) {
        e.preventDefault();

        if (this.state.idPost) {
            const item = this.props.item;
            this.props.postClick(this.state.idPost, item.idContent);
        }
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

        var typeFrom = (item.userTypeFrom === "ADMN") ? " AuditItem-admn" : "";
        var typeTo = (item.userTypeTo === "ADMN") ? " AuditItem-admn" : "";

        var userFrom = (item.idFrom) ? (
            <span>
                <a className={typeFrom} href={`/u/${item.usernameFrom}`}>{`${item.nicknameFrom} (@${item.usernameFrom})`}</a>&nbsp;
            </span>
        ) : (
            <span>{"(MISSING USER ID)"}</span>
        );
        var userTo = (item.idTo) ? (
            <span>
                <a className={typeTo} href={`/u/${item.usernameTo}`}>{`${item.nicknameTo} (@${item.usernameTo})`}</a>
            </span>
        ) : (
            <span>{"(MISSING USER ID)"}</span>
        );

        var barType = "";

        switch(item.type) {
            case 'RP':
                barType = " AuditItem-orange";
                var userFrom = (item.idFrom) ? (
                    <span>
                        <a className={typeFrom} href={`/u/${item.usernameFrom}`}>{`${item.nicknameFrom} (@${item.usernameFrom})`}</a>&nbsp;
                    </span>
                ) : (
                    <span>{"(MISSING USER ID)"}</span>
                );
                var userTo = (item.idTo) ? (
                    <span>
                        from&nbsp;
                        <a className={typeTo} href={`/u/${item.usernameTo}`}>{`${item.nicknameTo} (@${item.usernameTo})`}</a>
                    </span>
                ) : (
                    <span>{"(MISSING USER ID)"}</span>
                );
                result = (
                    <span>
                        {userFrom}
                        <span>REPORTED&nbsp;
                        <a href={`/p/${item.idContent}`} onClick={this.handlePostClick}>{`post#${item.idContent}`}</a>&nbsp;</span>
                        {userTo}
                        <br /><br /><span className='AuditItem-ts' onClick={() => this.setState(state => ({ toggleTime: !state.toggleTime }))}>{time}</span>
                    </span>
                );
                break;

            case 'RR':
                barType = " AuditItem-yellow";
                userTo = (item.idTo) ? (
                    <span>
                        from&nbsp;
                        <a className={typeTo} href={`/u/${item.usernameTo}`}>{`${item.nicknameTo} (@${item.usernameTo})`}</a>
                    </span>
                ) : (
                    <span>{"(MISSING USER ID)"}</span>
                );
                var postLink = (this.state.idPost) ? (
                    <span>REPORTED&nbsp;
                        <a href={`/p/${this.state.idPost}/r/${item.idContent}`} onClick={this.handleReplyClick}>{`reply#${item.idContent}`}</a>&nbsp;
                    </span>
                ) : (
                    <span>REPORTED&nbsp;{`reply#${item.idContent}`}&nbsp;</span>
                );
                result = (
                    <span>
                        {userFrom}
                        {postLink}
                        {userTo}
                        <br /><br /><span className='AuditItem-ts' onClick={() => this.setState(state => ({ toggleTime: !state.toggleTime }))}>{time}</span>
                    </span>
                )
                break;

            case 'RU':
                barType = " AuditItem-red";
                result = (
                    <span>
                        {userFrom}
                        <span>REPORTED user&nbsp;</span>
                        {userTo}
                        <br /><br /><span className='AuditItem-ts' onClick={() => this.setState(state => ({ toggleTime: !state.toggleTime }))}>{time}</span>
                    </span>
                )
                break;

            case 'DP':
                var whomst = (item.idFrom === item.idTo) ? (
                    <span>DELETED their own post#{item.idContent}</span>
                ) : (
                    <span>DELETED post#{item.idContent} from&nbsp;
                    <span>{userTo}</span>
                    </span>
                );
                result = (
                    <span>
                        {userFrom}
                        {whomst}
                        <br /><br /><span className='AuditItem-ts' onClick={() => this.setState(state => ({ toggleTime: !state.toggleTime }))}>{time}</span>
                    </span>
                )
                break;

            case 'DR':
                var postLink = (this.state.idPost) ? (
                    <a href={`/p/${this.state.idPost}/r/${item.idContent}`} onClick={this.handleReplyClick}>{`reply#${item.idContent}`}</a>
                ) : (
                    `reply#${item.idContent}`
                );
                var whomst = (item.idFrom === item.idTo) ? (
                    <span>DELETED their own {postLink}</span>
                ) : (
                    <span>DELETED {postLink}&nbsp;
                    <span>by {userTo}</span>
                    </span>
                );
                result = (
                    <span>
                        {userFrom}
                        {whomst}
                        <br /><br /><span className='AuditItem-ts' onClick={() => this.setState(state => ({ toggleTime: !state.toggleTime }))}>{time}</span>
                    </span>
                )
                break;

            case 'BU':
                result = (
                    <span>
                        {userFrom}
                        <span>BANNED user&nbsp;</span>
                        {userTo}
                        <br /><br /><span className='AuditItem-ts' onClick={() => this.setState(state => ({ toggleTime: !state.toggleTime }))}>{time}</span>
                    </span>
                )
                break;

            case 'UU':
                result = (
                    <span>
                        {userFrom}
                        <span>UNBANNED user&nbsp;</span>
                        {userTo}
                        <br /><br /><span className='AuditItem-ts' onClick={() => this.setState(state => ({ toggleTime: !state.toggleTime }))}>{time}</span>
                    </span>
                )
                break;

            default:
                break;
        }

        return (
            <tr className='AuditItem'>
                <td className={'AuditItem-td AuditItem-action' + barType}>{result}</td>
                <td className='AuditItem-td'>{he.decode(item.reason)}</td>
            </tr>
        )
    }
}