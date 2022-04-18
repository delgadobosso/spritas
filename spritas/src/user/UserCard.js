import './UserCard.css';
import pfp from '../images/pfp.png';

export default function UserCard(props) {
    var username;
    var nickname;
    var bio;
    var ts;
    if (props.thisUser) {
        username = props.thisUser.username;
        nickname = props.thisUser.nickname;
        bio = props.thisUser.bio;
        ts = new Date(props.thisUser.ts);
        ts = `Joined ${ts.toDateString()}`;
    }

    return (
        <div className='UserCard'>
            <div className='UserCard-avatarContainer'>
                <img className='UserCard-avatar' src={pfp} alt='Avatar' />
            </div>
            <h2 className='UserCard-nickname'>{nickname}</h2>
            <p className='UserCard-username'>{username}</p>
            <p className='UserCard-bio'>{bio}</p>
            <p className='UserCard-ts'>{ts}</p>
        </div>
    );
}