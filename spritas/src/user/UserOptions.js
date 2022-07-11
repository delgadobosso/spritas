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
                report = <div className='UserOptions-option' onClick={() => reportUser(props)}>Report User</div>;
            // You ARE admin
            } else {
                ban = (props.thisUser && props.thisUser.type !== "BAN") ?
                    <div className='UserOptions-option' onClick={() => banUser(props)}>Ban User</div> :
                    <div className='UserOptions-option' onClick={() => unbanUser(props)}>Unban User</div>;
            }

            block = (props.thisUser.blocking) ? <div className='UserOptions-option' onClick={() => unblockUser(props)}>Unblock User</div>
            : <div className='UserOptions-option' onClick={() => blockUser(props)}>Block User</div>;
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
        var answer = prompt(`Are you sure you want to ban ${props.thisUser.nickname} (@${props.thisUser.username})?\nType "${props.thisUser.username}" to confirm:`, '');
        if (answer === props.thisUser.username) {
            var reason = prompt(`Why are you banning ${props.thisUser.nickname} (@${props.thisUser.username})?`, '');
            if (reason) {
                var myBody = new URLSearchParams();
                myBody.append('reason', reason);

                fetch('/ban/user/' + props.thisId, {
                    method: "POST",
                    body: myBody
                })
                .then((resp) => {
                    if (resp.ok) window.location.href = '/u/' + props.thisUser.username;
                    else alert('User ban error');
                });
            } else if (reason === "") alert(`You must give a reason to ban this user.`);
        } else if (answer !== null) alert(`Value incorrect. User not banned.`);
    }
}

function unbanUser(props) {
    if (props.thisId && props.thisUser) {
        var answer = prompt(`Are you sure you want to unban ${props.thisUser.nickname} (@${props.thisUser.username})?\nType "${props.thisUser.username}" to confirm:`, '');
        if (answer === props.thisUser.username) {
            var reason = prompt(`Why are you banning ${props.thisUser.nickname} (@${props.thisUser.username})?`, '');
                if (reason) {
                    var myBody = new URLSearchParams();
                    myBody.append('reason', reason);

                    fetch('/unban/user/' + props.thisId, {
                        method: "POST",
                        body: myBody
                    })
                    .then((resp) => {
                        if (resp.ok) window.location.href = '/u/' + props.thisUser.username;
                        else alert('User ban error');
                    });
            } else if (reason === "") alert(`You must give a reason to unban this user.`);
        } else if (answer !== null) alert(`Value incorrect. User will stay banned.`);
    }
}

function blockUser(props) {
    if (props.thisId && props.thisUser) {
        var answer = prompt(`Are you sure you want to block ${props.thisUser.nickname} (@${props.thisUser.username})? They won't be able to reply to your posts.\nType "${props.thisUser.username}" to confirm:`, '');
        if (answer === props.thisUser.username) {
            fetch('/block/user/' + props.thisId, {
                method: "POST"
            })
            .then((resp) => {
                if (resp.ok) window.location.href = '/u/' + props.thisUser.username;
                else alert('User block error');
            });
        } else if (answer !== null) alert(`Value incorrect. User not blocked.`);
    }
}

function unblockUser(props) {
    if (props.thisId && props.thisUser) {
        var answer = prompt(`Are you sure you want to unblock ${props.thisUser.nickname} (@${props.thisUser.username})?\nType "${props.thisUser.username}" to confirm:`, '');
        if (answer === props.thisUser.username) {
            fetch('/unblock/user/' + props.thisId, {
                method: "POST"
            })
            .then((resp) => {
                if (resp.ok) window.location.href = '/u/' + props.thisUser.username;
                else alert('User unblock error');
            });
        } else if (answer !== null) alert(`Value incorrect. User still blocked.`);
    }
}

function reportUser(props) {
    if (props.thisId && props.thisUser) {
        var answer = prompt(`Why are you reporting ${props.thisUser.nickname} (@${props.thisUser.username})?`, '');
        if (answer) {
            var myBody = new URLSearchParams();
            myBody.append('id', props.thisUser.id);
            myBody.append('reason', answer);

            fetch('/report/user', {
                method: 'POST',
                body: myBody
            })
            .then(resp => {
                if (resp.ok) alert('This user has been reported to the Admins.');
                else alert('Error reporting post. Please try again or reach out directly to an Admin.');
            })
        } else if (answer === '') alert(`You must give a reason to report this user.`);
    }
}