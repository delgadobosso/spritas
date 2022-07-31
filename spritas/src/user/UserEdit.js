import './UserEdit.css';
import pfp from '../images/pfp.png';
import React from 'react';

import { AppContext } from '../contexts/AppContext';

export default class UserEdit extends React.Component {
    constructor(props) {
        super(props);
        this.handleImg = this.handleImg.bind(this);
        this.handleNickname = this.handleNickname.bind(this);
        this.handleBio = this.handleBio.bind(this);
        this.state = {
            imgPreview: null
        };
    }

    componentDidMount() {
        if (this.props.cardHeight) {
            const card = document.getElementById('UserEdit-Card');
            console.log(this.props.cardHeight, card.scrollHeight);
            card.animate([
                { height: `${this.props.cardHeight}px` },
                { height: `${card.scrollHeight}px` }
            ], { duration: 500, easing: 'ease' });
        }
    }

    handleImg(e) {
        const file = e.target.files[0];

        // Check file size
        if (file.size > 1048576) {
            e.target.value = '';
            this.context.toastPush('failure', 'file-large-1');
        } else {
            const reader = new FileReader();
    
            if (!file.type.startsWith('image/')) return;
        
            reader.onload = ((e) => { this.setState({ imgPreview: e.target.result }); });
            reader.readAsDataURL(file);
        }
    }

    handleNickname(e) {
        const nickname = e.target.value;

        if (nickname === "" || nickname === this.props.thisUser.nickname) e.target.classList.remove('UserEdit-textChanged');
        else e.target.classList.add('UserEdit-textChanged');
    }

    handleBio(e) {
        const bio = e.target.value;

        if (bio === this.props.thisUser.bio) e.target.classList.remove('UserEdit-textChanged');
        else e.target.classList.add('UserEdit-textChanged');
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

        var avatarClass = (this.state.imgPreview) ? " UserEdit-avatarChanged" : "";

        return (
            <div id='UserEdit-Card' className='UserCard'>
                <div className='UserCard-avatarContainer'>
                    <label htmlFor='UserEdit-avatarFile'>
                        <img className={'UserCard-avatar UserEdit-avatar' + avatarClass} src={avatar} alt='Avatar' />
                    </label>
                    <input type='file' name='avatar' id='UserEdit-avatarFile'
                    onChange={this.handleImg} accept="image/png, image/jpeg, image/gif" />
                    
                </div>
                <label className="sr-only" htmlFor='UserEdit-nickname'>Nickname</label>
                <input className='UserEdit-nickname' id='UserEdit-nickname' type='text' name='nickname' placeholder={nickname} autoComplete='off' autoCapitalize='off' onChange={this.handleNickname} />
                <p className='UserCard-username'>@{username}</p>
                <label className="sr-only" htmlFor='UserEdit-bio'>About You</label>
                <textarea className='UserEdit-bio' id='UserEdit-bio' name='bio' placeholder='About You' defaultValue={bio} maxLength='300' onChange={this.handleBio} />
                <p className='UserCard-ts'>{ts}</p>
            </div>
        );
    }
}

UserEdit.contextType = AppContext;
