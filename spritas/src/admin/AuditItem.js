import React from 'react';
import './AuditItem.css';
import he from 'he';
import relativeTime from '../functions/relativeTime';

export default class AuditItem extends React.Component {
    constructor(props) {
        super(props);
        this.handlePostClick = this.handlePostClick.bind(this);
        this.handleReplyClick = this.handleReplyClick.bind(this);
        this.handleAction = this.handleAction.bind(this);
        this.state = {
            toggleTime: false,
            idPost: null,
            actioned: this.props.item.actioned,
            actioning: false
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

    handleAction() {
        var confirm = (this.state.actioned) ? window.confirm('Revert this item to unresolved?') : window.confirm('Has this item been resolved?');
        if (confirm) {
            if (!this.state.actioning) {
                this.setState({ actioning: true }, () => {
                    const item = this.props.item;

                    var myBody = new URLSearchParams();
                    myBody.append('id', item.id);
                    var actioned = !this.state.actioned ? 1 : 0;
                    myBody.append('actioned', actioned);

                    fetch('/admin/action', {
                        method: 'POST',
                        body: myBody
                    })
                    .then(resp => { if (resp.ok) return resp.text(); })
                    .then(data => {
                        if (data === 'changed' || data === 'same') {
                            this.setState(state => ({
                                actioning: false,
                                actioned: !state.actioned
                            }));
                        }
                        if (data === 'same') alert('Someone has already changed this value.');
                    })
                    .catch(() => this.setState({ actioning: false }));
                });
            }
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

        var actioned;
        var actionClass = "";
        if (item.type === 'RP' || item.type === 'RR' || item.type === 'RU') {
            actionClass = " AuditItem-actioned";
            actioned = <input type='checkbox' checked={this.state.actioned}></input>;
            if (this.state.actioned) barType = " AuditItem-green";
        }

        return (
            <tr className='AuditItem'>
                <td className={'AuditItem-td AuditItem-action' + barType}>{result}</td>
                <td className='AuditItem-td'>{he.decode(item.reason)}</td>
                <td className={'AuditItem-td' + actionClass} onClick={ (item.type === 'RP' || item.type === 'RR' || item.type === 'RU') ? this.handleAction : undefined }>{actioned}</td>
            </tr>
        )
    }
}