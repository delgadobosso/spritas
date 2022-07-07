import './PostHome.css';
import PostContainer from './PostContainer';
import React from 'react';

export default class PostHome extends React.Component {
    componentDidMount() {
        // Navi Hide
        this.props.naviHide(false); // Always show it when opening post
        var con = document.getElementById("PostHome-" + this.props.id);
        var naviTime = false;
        var prevScroll = con.scrollTop;
        con.onscroll = () => {
          clearTimeout(naviTime);
          naviTime = setTimeout(() => {
            var down = prevScroll < con.scrollTop;
            this.props.naviHide(down);
            prevScroll = con.scrollTop;
          }, 50);
        }
    }
    
    render() {
        return (
            <div className="PostHome" id={"PostHome-" + this.props.id}>
                <div className="PostHome-back" onClick={ () => { window.history.go(-1); } }>Go Back</div>
                <PostContainer id={this.props.id} idReply={this.props.idReply} user={this.props.user} naviHide={this.props.naviHide} />
            </div>
        )
    }
}