import './UserCard.css';
import pfp from '../images/pfp.png';
import React from 'react';

export default class UserCard extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if (this.props.cardHeight && this.props.thisUser) {
            const card = document.getElementById('UserCard-' + this.props.thisUser.id);
            card.animate([
                { height: `${this.props.cardHeight}px` },
                { height: `${card.scrollHeight}px` }
            ], { duration: 500, easing: 'ease' });
        }
    }

    render() {
        var id;
        var avatar;
        var username;
        var nickname;
        var bio;
        var ts;
        var ban;
        var blocked;
        var blocking;
        if (this.props.thisUser) {
            id = this.props.thisUser.id;
            avatar = (this.props.thisUser.avatar) ? `/media/avatars/${this.props.thisUser.avatar}` : pfp;
            username = this.props.thisUser.username;
            nickname = this.props.thisUser.nickname;
            bio = this.props.thisUser.bio;
            ts = new Date(this.props.thisUser.ts);
            ts = `Joined ${ts.toDateString()}`;
            if (this.props.thisUser.type === "BAN") ban = <h2 className='UserCard-username'>BANNED</h2>;
            if (this.props.thisUser.blocked) blocked = <p className='UserCard-username'>This User Blocked You</p>
            if (this.props.thisUser.blocking) blocking = <p className='UserCard-username'>You Blocked This User</p>
        }

        return (
            <div id={'UserCard-' + id} className='UserCard'>
                {ban}
                <div className='UserCard-avatarContainer'>
                    <img className={'UserCard-avatar' + this.props.uneditClass} src={avatar} alt='Avatar' />
                </div>
                <h2 className='UserCard-nickname'>{nickname}</h2>
                <p className='UserCard-username'>@{username}</p>
                {blocked}
                {blocking}
                <p className='UserCard-bio'>{bio}</p>
                <p className='UserCard-ts'>{ts}</p>
            </div>
        );
    }
}