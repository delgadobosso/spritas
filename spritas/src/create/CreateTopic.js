import './CreateTopic.css';

export default function CreateTopic(props) {
    document.title = "Create a Topic - The Spritas";
    const id = props.match.params.id;

    return (
        <div className="CreateTopic">
            <form action="/create/topic/" className="CreateTopic-form" method="POST">
                <h1>Create a Topic</h1>
                <input type="hidden" name="id" id="id" value={id} />
                <div className="CreateTopic-item">
                    <label htmlFor="name">Topic Name: </label>
                    <input type="text" name="name" id="name" required />
                </div>
                <div className="CreateTopic-item">
                    <label htmlFor="description">Description: </label>
                    <textarea type="text" name="description" id="description" rows="3" cols="50" required />
                </div>
                <div className="CreateTopic-item">
                    <label htmlFor="type">Type: </label>
                    <select name="type" id="type">
                        <option value="TEXT">Text</option>
                        <option value="BLOG">News</option>
                        <option value="VIDO">Video</option>
                        <option value="IMG">Image</option>
                    </select>
                </div>
                <div className="CreateTopic-item">
                    <label htmlFor="perm">Permission Level: </label>
                    <select name="perm" id="perm">
                        <option value="ALL">All Users</option>
                        <option value="ADMN">Admins Only</option>
                    </select>
                </div>
                <div className="CreateTopic-item">
                    <input type="submit" value="Create" />
                </div>
            </form>
        </div>
    )
}