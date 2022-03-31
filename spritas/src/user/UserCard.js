import React from 'react';
import './UserCard.css';
import pfp from '../images/pfp.png';

export default class UserCard extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const name = (this.props.thisUser) ? this.props.thisUser.name : null;

        return (
            <div className='UserCard'>
                <img className='UserCard-avatar' src={pfp} />
                <h2 className='UserCard-name'>{name}</h2>
            </div>
        )
    }
}