import './UserOptions.css';

export default function UserOptions(props) {
    var edit;
    var report;
    var block;
    var ban;

    // If this user is you
    if (props.user.id === parseInt(props.thisId)) {
        edit = <div className='UserOptions-option'>Edit Profile</div>;
    // If this user isn't you
    } else if (props.user.id !== parseInt(props.thisId)) {
        // And you're not admin
        if (props.user.type !== 'ADMN') {
            report = <div className='UserOptions-option'>Report User</div>;
        // You ARE admin
        } else {
            ban = <div className='UserOptions-option'>Ban User</div>;
        }

        block = <div className='UserOptions-option'>Block User</div>;
    }

    return (
        <div className='UserCard'>
            {edit}
            {report}
            {block}
            {ban}
        </div>
    );
}