import './UserOptions.css';

export default function UserOptions(props) {
    var edit;
    var report;
    var block;
    var ban;
    var submit;
    var cancel;

    // If in edit mode
    if (!props.editMode) {
        // If this user is you
        if (props.user.id === parseInt(props.thisId)) {
            edit = <div className='UserOptions-option' onClick={() => props.userEdit(true)}>Edit Profile</div>;
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
    } else {
        submit = <div className='UserOptions-option'>Save Changes</div>;
        cancel = <div className='UserOptions-option' onClick={() => props.userEdit(false)}>Cancel</div>;
    }

    return (
        <div className='UserCard'>
            {edit}
            {report}
            {block}
            {ban}
            {submit}
            {cancel}
        </div>
    );
}