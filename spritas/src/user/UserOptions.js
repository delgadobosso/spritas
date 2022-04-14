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
        submit = <div className='UserOptions-option' onClick={() => editCheck(props)}>Save Changes</div>;
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

function editCheck(props) {
    var formData = new FormData();
    const avatar = document.getElementById('UserEdit-avatar').files[0];
    const name = document.getElementById('UserEdit-name').value;
    const bio = document.getElementById('UserEdit-bio').value;

    const ogBio = (props.thisUser) ? props.thisUser.bio : '';
    
    if (!avatar && name === '' && bio === ogBio) alert('No changes made.');
    else {
        var choice = window.confirm("You won't be able to update your profile again for an hour. Are you sure you wish to save these changes?");
        if (choice) {
            var formData = new FormData();
            if (avatar) formData.append('avatar', avatar, avatar.name);
            formData.append('name', name);
            formData.append('bio', bio);

            fetch('/user/update', {
                method: 'POST',
                body: formData
            })
            .then(resp => {
                if (resp.ok) console.log('ok');
                else console.error('User update error');
            });
        }
    }
}