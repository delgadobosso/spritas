import './UserCard.css';
import pfp from '../images/pfp.png';

export default function UserCard(props) {
    var avatar;
    var username;
    var nickname;
    var bio;
    var ts;
    var ban;
    var blocked;
    if (props.thisUser) {
        avatar = (props.thisUser.avatar) ? `/media/avatars/${props.thisUser.avatar}` : pfp;
        username = props.thisUser.username;
        nickname = props.thisUser.nickname;
        bio = props.thisUser.bio;
        ts = new Date(props.thisUser.ts);
        ts = `Joined ${ts.toDateString()}`;
        if (props.thisUser.type === "BAN") ban = <h2 className='UserCard-nickname'>Banned</h2>;
        if (props.thisUser.blocked) blocked = <h2 className='UserCard-nickname'>Blocking You</h2>
    }

    return (
        <div className='UserCard'>
            {ban}
            {blocked}
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