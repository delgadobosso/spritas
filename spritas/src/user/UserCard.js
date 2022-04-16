import './UserCard.css';
import pfp from '../images/pfp.png';

export default function UserCard(props) {
    var name;
    var bio;
    var ts;
    if (props.thisUser) {
        name = props.thisUser.nickname;
        bio = props.thisUser.bio;
        ts = new Date(props.thisUser.ts);
        ts = `Joined ${ts.toDateString()}`;
    }

    return (
        <div className='UserCard'>
            <div className='UserCard-avatarContainer'>
                <img className='UserCard-avatar' src={pfp} alt='Avatar' />
            </div>
            <h2 className='UserCard-name'>{name}</h2>
            <p className='UserCard-bio'>{bio}</p>
            <p className='UserCard-ts'>{ts}</p>
        </div>
    );
}