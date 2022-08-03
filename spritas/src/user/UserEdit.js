import './UserEdit.css';
import pfp from '../images/pfp.png';
import React from 'react';
import CrossIcon from '../icons/cross';

import { AppContext } from '../contexts/AppContext';

export default class UserEdit extends React.Component {
    constructor(props) {
        super(props);
        this.handleImg = this.handleImg.bind(this);
        this.handleNickname = this.handleNickname.bind(this);
        this.handleBio = this.handleBio.bind(this);
        this.tooltipAdd = this.tooltipAdd.bind(this);
        this.tooltipRemove = this.tooltipRemove.bind(this);
        this.removeUpload = this.removeUpload.bind(this);
        this.state = {
            imgPreview: null,
            removeable: false
        };
    }

    componentDidMount() {
        const bioField = document.getElementById('UserEdit-bio');
        if (bioField) {
            bioField.style.height = bioField.scrollHeight + 20 + "px";
            bioField.animate([
                { height: bioField.scrollHeight + 20 + "px" },
                { height: bioField.scrollHeight + 20 + "px" }
            ], { duration: 500, easing: 'ease', fill: 'forwards' });
        }
        this.tooltipAdd('tip-avatar');
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
        
            reader.onload = ((e) => { this.setState({
                imgPreview: e.target.result,
                removeable: true
            }); });
            reader.readAsDataURL(file);
        }
    }

    handleNickname(e) {
        const nickname = e.target.value;
        e.target.value = nickname.trimStart().slice(0, 32).replace(/[\s]{2,}/g, " ");

        if (nickname === "" || nickname === this.props.thisUser.nickname) e.target.classList.remove('UserEdit-textChanged');
        else e.target.classList.add('UserEdit-textChanged');
    }

    handleBio(e) {
        const bio = e.target.value;

        var newLines = bio.match(/(\r\n|\n|\r)/g);
        var trueCount = bio.length;
        if (newLines) trueCount += newLines.length;
        if (trueCount > 255 && newLines) e.target.value = bio.slice(0, 255 - newLines.length);
        else if (trueCount > 255) e.target.value = bio.slice(0, 255);

        e.target.style.setProperty('height', "0px", 'important');
        e.target.style.setProperty('height', e.target.scrollHeight + 10 + "px", 'important');

        if (bio === this.props.thisUser.bio) e.target.classList.remove('UserEdit-textChanged');
        else e.target.classList.add('UserEdit-textChanged');
    }

    tooltipAdd(tip) {
        const tooltip = document.getElementById(tip);
        if (tooltip) tooltip.classList.add('Tooltip-on');
    }
    
    tooltipRemove(tip) {
        const tooltip = document.getElementById(tip);
        if (tooltip) tooltip.classList.remove('Tooltip-on');
    }

    removeUpload() {
        var avatar = document.getElementById('UserEdit-avatarFile');
        if (avatar) avatar.value = "";
        this.setState({
            imgPreview: null,
            removeable: false
        });
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

        var crossClass = '';
        var pathClass = 'CreatePost-pathClass';
        var crossColor = 'var(--darkest-grey)';
        if (this.state.removeable) {
            crossClass = ' UserEdit-remove';
            crossColor = 'var(--spritan-red)';
        }

        return (
            <div id='UserEdit-Card' className='UserCard'>
                <div className='UserCard-avatarContainer'>
                    <label htmlFor='UserEdit-avatarFile'>
                        <img className={'UserCard-avatar UserEdit-avatar' + avatarClass} src={avatar} alt='Avatar' />
                    </label>
                    <input type='file' name='avatar' id='UserEdit-avatarFile'
                    onChange={this.handleImg} accept="image/png, image/jpeg, image/gif" />
                    <div className={'UserEdit-iconWrapper' + crossClass} onClick={this.removeUpload}>
                        <CrossIcon title='Remove File' stroke={crossColor} pathClass={pathClass} />
                    </div>
                    <span id="tip-avatar" className="Tooltip">Avatar Seen Everywhere.<br></br>1 MB Max.<br></br>128x128px PNG, JPEG, or GIF.</span>
                </div>
                <div className='UserEdit-item'>
                    <label className="sr-only" htmlFor='UserEdit-nickname'>Display Name</label>
                    <input className='UserEdit-nickname' id='UserEdit-nickname' type='text' name='nickname' placeholder={nickname} maxLength='32' autoComplete='off' autoCapitalize='off' onChange={this.handleNickname} onFocus={() => this.tooltipAdd('tip-displayname')} onBlur={() => this.tooltipRemove('tip-displayname')} />
                    <span id="tip-displayname" className="Tooltip">Name Seen Everywhere.<br></br>32 Characters Max.</span>
                </div>
                <p className='UserCard-username'>@{username}</p>
                <div className='UserEdit-item'>
                    <label className="sr-only" htmlFor='UserEdit-bio'>About You</label>
                    <textarea className='UserEdit-bio' id='UserEdit-bio' name='bio' placeholder='About You' defaultValue={bio} maxLength='256' onChange={this.handleBio} onFocus={() => this.tooltipAdd('tip-bio')} onBlur={() => this.tooltipRemove('tip-bio')} />
                    <span id="tip-bio" className="Tooltip">Describe Yourself.<br></br>256 Characters Max.</span>
                </div>
                <p className='UserCard-ts'>{ts}</p>
            </div>
        );
    }
}

UserEdit.contextType = AppContext;
