import './UserEdit.css';
import pfp from '../images/pfp.png';
import React from 'react';

export default class UserEdit extends React.Component {
    constructor(props) {
        super(props);
        this.handleImg = this.handleImg.bind(this);
        this.state = { imgPreview: null };
    }

    handleImg(e) {
        const file = e.target.files[0];

        // Check file size
        if (file.size > 1048576) {
            e.target.value = '';
            alert('The file you selected is too large. Image must be 1 MB or less.');
        } else {
            const reader = new FileReader();
    
            if (!file.type.startsWith('image/')) return;
        
            reader.onload = ((e) => { this.setState({ imgPreview: e.target.result }); });
            reader.readAsDataURL(file);
        }
    }

    render() {
        var ogAvatar = (this.props.user && this.props.user.avatar)  ? `/media/avatars/${this.props.user.avatar}` : pfp;

        var avatar;
        var username;
        var nickname;
        var bio;
        var ts;
        if (this.props.thisUser) {
            avatar = (this.state.imgPreview) ? this.state.imgPreview : ogAvatar;
            username = this.props.thisUser.username;
            nickname = this.props.thisUser.nickname;
            bio = this.props.thisUser.bio;
            ts = new Date(this.props.thisUser.ts);
            ts = `Joined ${ts.toDateString()}`;
        }

        return (
            <div className='UserCard'>
                <div className='UserCard-avatarContainer'>
                    <input type='file' name='avatar' id='UserEdit-avatar'
                    onChange={this.handleImg} accept="image/png, image/jpeg, image/gif" />
                    <img className='UserCard-avatar' src={avatar} alt='Avatar' />
                </div>
                <input className='UserEdit-nickname' id='UserEdit-nickname' type='text' name='nickname' placeholder={nickname} />
                <p className='UserCard-username'>@{username}</p>
                <textarea className='UserEdit-bio' id='UserEdit-bio' name='bio' placeholder='About You' defaultValue={bio} maxLength='256' />
                <p className='UserCard-ts'>{ts}</p>
            </div>
        );
    }
}