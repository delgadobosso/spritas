import React from 'react';
import './Featured.css';

export default class Featured extends React.Component {
    constructor(props) {
        super(props);
        this.scrollTo = this.scrollTo.bind(this);
    }

    scrollTo() {
        var feat = document.getElementById('featured');
        feat.scrollIntoView({ behavior: "smooth" });
        if (window.location.hash !== "#featured") window.history.pushState({}, "", "#featured");
    }

    render() {
        return (
            <div id='featured' className='Featured'>
                <div className='Featured-header' onClick={this.scrollTo}>
                    <h1 className='Featured-title'>Featured</h1>
                </div>
                <div className='Featured-videoContainer'>
                    <div className='Featured-video'>
                        <iframe width='100%' height='675'
                            title='Featured-Video' allowFullScreen
                            src='https://www.youtube.com/embed/jIGyeOXJpwA?modestbranding=1'>
                        </iframe>
                    </div>
                </div>
            </div>
        );
    }
}
