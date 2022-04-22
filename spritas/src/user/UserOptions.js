import './UserOptions.css';

export default function UserOptions(props) {
    var edit;
    var report;
    var block;
    var ban;
    var submit;
    var cancel;

    // If not in edit mode
    if (!props.editMode) {
        // If this user is you
        if (props.user.id === parseInt(props.thisId)) {
            edit = <div className='UserOptions-option' onClick={() => editTimeCheck(props)}>Edit Profile</div>;
        // If this user isn't you
        } else if (props.user.id !== parseInt(props.thisId)) {
            // And you're not admin
            if (props.user.type !== 'ADMN') {
                report = <div className='UserOptions-option'>Report User</div>;
            // You ARE admin
            } else {
                ban = (props.thisUser && props.thisUser.type !== "BAN") ?
                    <div className='UserOptions-option' onClick={() => banUser(props)}>Ban User</div> :
                    <div className='UserOptions-option' onClick={() => unbanUser(props)}>Unban User</div>;
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
    const nickname = document.getElementById('UserEdit-nickname').value;
    const bio = document.getElementById('UserEdit-bio').value;

    const ogBio = (props.thisUser) ? props.thisUser.bio : '';
    
    if (!avatar && nickname === '' && bio === ogBio) alert('No changes made.');
    else {
        var choice = window.confirm("You won't be able to update your profile again for 5 minutes. Are you sure you wish to save these changes?");
        if (choice) {
            if (avatar) formData.append('avatar', avatar, props.user.id);
            formData.append('id', props.user.id);
            formData.append('nickname', nickname);
            formData.append('bio', bio);

            fetch('/user/update', {
                method: 'POST',
                body: formData
            })
            .then(resp => resp.text())
            .then(data => {
                if (data === 'time') alert('You must wait 5 minutes from when you last updated your profile.');
                else if (data === 'updated') {
                    window.location.reload();
                }
            })
        }
    }
}

function editTimeCheck(props) {
    var last = new Date(props.thisUser.lastTs);
    var current = new Date();
    var elapsed = (current - last) / 60000;

    if (elapsed >= 5) props.userEdit(true);
    else alert('You must wait 5 minutes from when you last updated your profile.');
}

function banUser(props) {
    if (props.thisId && props.thisUser) {
        var answer = prompt(`Are you sure you want to ban ${props.thisUser.nickname} (${props.thisUser.username})?\nType "${props.thisUser.username}" to confirm:`, '');
        if (answer === props.thisUser.username) {
            fetch('/ban/user/' + props.thisId, {
                method: "POST"
            })
            .then((resp) => {
                if (resp.ok) window.location.href = '/u/' + props.thisUser.username;
                else alert('User ban error');
            });
        } else if (answer !== null) alert(`Value incorrect. User not banned.`);
    }
}

function unbanUser(props) {
    if (props.thisId && props.thisUser) {
        var answer = prompt(`Are you sure you want to unban ${props.thisUser.nickname} (${props.thisUser.username})?\nType "${props.thisUser.username}" to confirm:`, '');
        if (answer === props.thisUser.username) {
            fetch('/unban/user/' + props.thisId, {
                method: "POST"
            })
            .then((resp) => {
                if (resp.ok) window.location.href = '/u/' + props.thisUser.username;
                else alert('User ban error');
            });
        } else if (answer !== null) alert(`Value incorrect. User will stay banned.`);
    }
}