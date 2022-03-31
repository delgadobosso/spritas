import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import './App.css';
import Header from './header/Header'
import TopicContainer from './topics/TopicContainer';
import Login from './login/Login';
import Navi from './navigation/Navi';
import PostContainer from './posts/PostContainer';
import CreateTopic from './create/CreateTopic';
import CreatePost from './create/CreatePost';
import PostHome from "./posts/PostHome";
import Featured from "./featured/Featured";
import UserContainer from './user/UserContainer';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.postClick = this.postClick.bind(this);
    this.naviHide = this.naviHide.bind(this);
    this.state = {
      user: null,
      post: null,
      naviHide: false
    };
  }

  componentDidMount() {
    if (window.location.pathname === "/") window.history.replaceState({}, "", window.location.pathname);
    window.history.scrollRestoration = 'manual';

    // Navi Hiding
    var naviTime = false;
    var prevScroll = window.scrollY;
    window.onscroll = () => {
      clearTimeout(naviTime);
      naviTime = setTimeout(() => {
        var down = prevScroll < window.scrollY;
        this.naviHide(down);
        prevScroll = window.scrollY;
      }, 50);
    }

    // PostHome Control
    window.onpopstate = (e) => {
      if (this.state.post && e.state && !e.state.id) {
        const posthome = document.getElementById("PostHome-" + this.state.post.props.id)
        posthome.style.opacity = 0;
        posthome.style.overflow = "hidden";
        document.body.style.overflow = "";
        document.title = "The Spritas";
        let headvid = document.getElementById('Header-video');
        if (headvid) headvid.play();
        const controller = new AbortController();
        posthome.addEventListener('transitionend', (e) => {
          if (e.currentTarget === e.target) {
            this.setState({ post: null });
          }
        }, {signal: controller.signal});
      } else if (e.state && e.state.id) {
        this.postClick(e.state.id, false);
      }
    }

    // Get User Data
    fetch('/session/user')
        .then(res => res.json())
        .then(data => { this.setState({ user: data }); })
        .catch((error) => { console.error('Error:', error); });
  }

  postClick(id, push = true) {
    if (!this.state.post) {
      var post = <PostHome id={id} naviHide={this.naviHide} user={this.state.user} />;
      this.setState({ post: post }, () => {
        if (push) {
          let stateObj = { id: id };
          window.history.pushState(stateObj, "", "/p/" + id);
          window.history.scrollRestoration = 'manual';
        }
        const posthome = document.getElementById("PostHome-" + this.state.post.props.id)
        setTimeout(() => posthome.style.opacity = 1, 10);
        document.body.style.overflow = "hidden";
        let headvid = document.getElementById('Header-video');
        if (headvid) headvid.pause();
      });
    }
  }

  naviHide(down) {
    if (down && !this.state.naviHide) this.setState({ naviHide: true });
    else if (!down && this.state.naviHide) this.setState({ naviHide: false });
  }

  render() {
    return (
      <div className="App">
        <Router>
          <Navi user={this.state.user} hide={this.state.naviHide} />
          <Header />
          <Switch>
            <Route path='/login' component={Login} />
            <Route path='/create/topic/:id?' component={CreateTopic} />
            <Route path='/create/post/:id' component={CreatePost} />
            <Route path='/user/:id'
              render={props => <UserContainer postClick={this.postClick} naviHide={this.naviHide} user={this.state.user} {...props} />} />
            <Route path='/post/:id'
              render={props => <PostContainer user={this.state.user} naviHide={this.naviHide} {...props} />} />
            <Route path='/'>
              <Featured user={this.state.user} />
              <TopicContainer postClick={this.postClick} user={this.state.user}
                naviHide={this.naviHide} />
              {this.state.post}
            </Route>
          </Switch>
        </Router>
      </div>
    );
  }
}
