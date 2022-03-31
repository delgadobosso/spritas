import React from 'react';
import UserCard from './UserCard';
import './UserContainer.css';

export default class UserContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            thisUser: null
        }
    }

    componentDidMount() {
        const id = (this.props.id) ? this.props.id : this.props.match.params.id;

        fetch(`/user/${id}`)
            .then(res => res.json())
            .then(data => { this.setState({ thisUser: data }); });
    }

    render() {
        return (
            <div className='UserContainer'>
                <UserCard user={this.props.user} thisUser={this.state.thisUser} />
            </div>
        )
    }
}