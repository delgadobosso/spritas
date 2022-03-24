import React from 'react';
import './Featured.css';
import he from 'he';
import { regex_video } from '../functions/constants';

export default class Featured extends React.Component {
    constructor(props) {
        super(props);
        this.scrollTo = this.scrollTo.bind(this);
        this.expand = this.expand.bind(this);
        this.state = {
            featured: null,
            open: false
        }
    }

    componentDidMount() {
        fetch('/featured')
            .then(res => res.json())
            .then(data => { this.setState({ featured: data[0] }); });
    }

    scrollTo() {
        var feat = document.getElementById('featured');
        feat.scrollIntoView({ behavior: "smooth" });
        if (window.location.hash !== "#featured") window.history.pushState({}, "", "#featured");
    }

    expand() { this.setState(state => ({ open: !state.open })); }

    render() {
        const link = (this.state.featured) ? this.state.featured.link : null;
        var video;
        if (link) {
            const re = new RegExp(regex_video);
            const dLink = he.decode(link);
            if (re.test(dLink)) {
                const matches = dLink.match(regex_video).groups;
                var source;
                for (const thisSrc in matches) {
                    if (thisSrc.includes('source') && matches[thisSrc]) source = matches[thisSrc];
                }
                var id;
                for (const thisId in matches) {
                    if (thisId.includes('id') && matches[thisId]) id = matches[thisId];
                }
                if (id) {
                    var embedSrc;
                    if (source === "youtube" || source === "youtu.be") embedSrc = `https://www.youtube.com/embed/${id}?modestbranding=1`;
                    else if (source === "streamable") embedSrc = `https://streamable.com/e/${id}`;
                    video =
                    <div className='Featured-video'>
                        <iframe width='100%' height='675'
                            title='Featured-Video' allowFullScreen
                            src={embedSrc}>
                        </iframe>
                    </div>
                }
            }
        }

        var update;
        const label = (this.state.open) ? 'Close' : 'Update Featured';
        const open = (this.state.open) ? ' Featured-form-open' : '';
        if (this.props.user && this.props.user.type === 'ADMN') {
            update = (
                <div className='Featured-update'>
                    <div className='UpdatePost-controlItem' onClick={this.expand}>{label}</div>
                    <form action="/update/featured/" className={'Featured-form' + open}
                        method='POST'>
                        <div className='CreatePost-item'>
                            <label htmlFor='link'>Link: </label>
                            <input type='text' name='link' id='link' required pattern={regex_video} />
                        </div>
                        <input className='Reply-submit' type='submit' value='Update' />
                    </form>
                </div>
            )
        }

        return (
            <div id='featured' className='Featured'>
                <div className='Featured-header' onClick={this.scrollTo}>
                    <h1 className='Featured-title'>Featured</h1>
                </div>
                <div className='Featured-videoContainer'>
                    {video}
                </div>
                {update}
            </div>
        );
    }
}
