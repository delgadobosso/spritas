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
                barType = " AuditItem-yellow";
                var userFrom = (item.idFrom) ? (
                    <span>
                        <a className={typeFrom} href={`/u/${item.usernameFrom}`}>{`${item.nicknameFrom} (@${item.usernameFrom})`}</a>&nbsp;
                    </span>
                ) : (
                    <span>{"(MISSING USER ID)"}</span>
                );
                var userTo = (item.idTo) ? (
                    <span>
                        by&nbsp;
                        <a className={typeTo} href={`/u/${item.usernameTo}`}>{`${item.nicknameTo} (@${item.usernameTo})`}</a>
                    </span>
                ) : (
                    <span>{"(MISSING USER ID)"}</span>
                );
                result = (
                    <span>
                        {userFrom}
                        <span>reported&nbsp;
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
                        by&nbsp;
                        <a className={typeTo} href={`/u/${item.usernameTo}`}>{`${item.nicknameTo} (@${item.usernameTo})`}</a>
                    </span>
                ) : (
                    <span>{"(MISSING USER ID)"}</span>
                );
                var postLink = (this.state.idPost) ? (
                    <span>reported&nbsp;
                        <a href={`/p/${this.state.idPost}/r/${item.idContent}`} onClick={this.handleReplyClick}>{`reply#${item.idContent}`}</a>&nbsp;
                    </span>
                ) : (
                    <span>reported&nbsp;{`reply#${item.idContent}`}&nbsp;</span>
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
                barType = " AuditItem-yellow";
                result = (
                    <span>
                        {userFrom}
                        <span>reported user&nbsp;</span>
                        {userTo}
                        <br /><br /><span className='AuditItem-ts' onClick={() => this.setState(state => ({ toggleTime: !state.toggleTime }))}>{time}</span>
                    </span>
                )
                break;

            case 'DP':
                barType = " AuditItem-orange";
                var whomst = (item.idFrom === item.idTo) ? (
                    <span>deleted their own post#{item.idContent}</span>
                ) : (
                    <span>deleted post#{item.idContent} from&nbsp;
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
                barType = " AuditItem-orange";
                var postLink = (this.state.idPost) ? (
                    <a href={`/p/${this.state.idPost}/r/${item.idContent}`} onClick={this.handleReplyClick}>{`reply#${item.idContent}`}</a>
                ) : (
                    `reply#${item.idContent}`
                );
                var whomst = (item.idFrom === item.idTo) ? (
                    <span>deleted their own {postLink}</span>
                ) : (
                    <span>deleted {postLink}&nbsp;
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
                barType = " AuditItem-red";
                result = (
                    <span>
                        {userFrom}
                        <span>banned user&nbsp;</span>
                        {userTo}
                        <br /><br /><span className='AuditItem-ts' onClick={() => this.setState(state => ({ toggleTime: !state.toggleTime }))}>{time}</span>
                    </span>
                )
                break;

            case 'UU':
                barType = " AuditItem-green";
                result = (
                    <span>
                        {userFrom}
                        <span>unbanned user&nbsp;</span>
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