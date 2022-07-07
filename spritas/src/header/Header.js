import React from 'react';
import './Header.css';
import video from '../videos/banner.mp4';
import logo from '../images/logo.png';
import title from '../images/title.png';

export default function Header() {
    // darker color: #003EB1

    return ( 
        <a className="Header" href="/home">
            <div className="Header-videoContainer">
                <video className="Header-video"
                id="Header-video" src={video}
                loop muted autoPlay disablePictureInPicture></video>
                <div className="Header-videoSides"></div>
            </div>
            <img className="Header-logo" src={logo}
                alt="Logo" />
            <img className="Header-title" src={title}
                alt="Title" />
        </a>
    );
}