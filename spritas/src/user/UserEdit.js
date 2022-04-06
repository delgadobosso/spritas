import './UserEdit.css';
import pfp from '../images/pfp.png';

export default function UserEdit(props) {
    var name;
    var bio;
    var ts;
    if (props.thisUser) {
        name = props.thisUser.name;
        bio = props.thisUser.bio;
        ts = new Date(props.thisUser.ts);
        ts = `Joined ${ts.toDateString()}`;
    }

    return (
        <div className='UserCard'>
            <form action="/update/profile" method='POST'>
                <div className='UserCard-avatarContainer'>
                    <img className='UserCard-avatar' src={pfp} alt='Avatar' />
                </div>
                <input className='UserEdit-name' type='text' name='name' placeholder={name} />
                <textarea className='UserEdit-bio' name='bio' placeholder={bio} />
                <p className='UserCard-ts'>{ts}</p>
            </form>
        </div>
    );
}