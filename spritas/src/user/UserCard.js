import React from 'react';
import './UserCard.css';
import pfp from '../images/pfp.png';

export default class UserCard extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        var name;
        var bio;
        var ts;
        if (this.props.thisUser) {
            name = this.props.thisUser.name;
            bio = this.props.thisUser.bio;
            ts = new Date(this.props.thisUser.ts);
            ts = `Joined ${ts.toDateString()}`;
        }

        return (
            <div className='UserCard'>
                <div className='UserCard-avatarContainer'>
                    <img className='UserCard-avatar' src={pfp} />
                </div>
                <h2 className='UserCard-name'>{name}</h2>
                <p className='UserCard-bio'>{bio}</p>
                <p className='UserCard-ts'>{ts}</p>
            </div>
        )
    }
}