import './UserCard.css';
import pfp from '../images/pfp.png';

export default function UserCard(props) {
    var avatar;
    var username;
    var nickname;
    var bio;
    var ts;
    if (props.thisUser) {
        avatar = (props.thisUser.avatar) ? `/media/avatars/${props.thisUser.avatar}` : pfp;
        username = props.thisUser.username;
        nickname = props.thisUser.nickname;
        bio = props.thisUser.bio;
        ts = new Date(props.thisUser.ts);
        ts = `Joined ${ts.toDateString()}`;
    }

    return (
        <div className='UserCard'>
            <div className='UserCard-avatarContainer'>
                <img className='UserCard-avatar' src={avatar} alt='Avatar' />
            </div>
            <h2 className='UserCard-nickname'>{nickname}</h2>
            <p className='UserCard-username'>{username}</p>
            <p className='UserCard-bio'>{bio}</p>
            <p className='UserCard-ts'>{ts}</p>
        </div>
    );
}