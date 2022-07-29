import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import './App.css';
import Header from './header/Header'
import Login from './login/Login';
import Navi from './navigation/Navi';
import PostContainer from './posts/PostContainer';
import CreatePost from './create/CreatePost';
import PostHome from "./posts/PostHome";
import UserContainer from './user/UserContainer';
import TopicContainer from './topics/TopicContainer';
import AdminPortal from "./admin/AdminPortal";
import Toast from "./toast/Toast";

import { AppContext } from "./contexts/AppContext";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.postClick = this.postClick.bind(this);
    this.naviHide = this.naviHide.bind(this);
    this.toastPush = this.toastPush.bind(this);
    this.toastClear = this.toastClear.bind(this);
    this.state = {
      user: null,
      sessionChecked: false,
      post: null,
      naviHide: false,
      toastPush: []
    };
  }

  componentDidMount() {
    if (window.location.pathname === "/home" || window.location.pathname.startsWith('/u/') || window.location.pathname.startsWith('/admin')) window.history.replaceState({}, "", window.location.pathname);
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
        this.postClick(e.state.id, e.state.idReply, false);
      }
    }

    // Get User Data
    fetch('/session/user')
      .then(res => {
        var contentType = res.headers.get("content-type");
        if (contentType) return res.json();
        else return;
      })
      .then(data => {
        this.setState({
          user: data,
          sessionChecked: true
        });
      })
      .catch((error) => { console.error('Error:', error); });
  }

  postClick(id, idReply = null, push = true) {
    if (!this.state.post) {
      var post = <PostHome id={id} idReply={idReply} naviHide={this.naviHide} user={this.state.user} />;
      this.setState({ post: post }, () => {
        if (push) {
          let stateObj = {
            id: id,
            idReply: idReply
          };
          const currentPath = window.location.pathname;
          var link = `${currentPath}/p/${id}`;
          if (idReply) link = `${link}/r/${idReply}`;
          window.history.pushState(stateObj, "", link);
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

  toastPush(success, event) {
    this.setState(state => ({ toastPush: [...state.toastPush, {
      success: success,
      event: event
    }]}));
  }

  toastClear() {
    this.setState({ toastPush: [] });
  }

  render() {
    return (
      <div className="App">
        <AppContext.Provider value={{
          toastPush: this.toastPush
        }}>
          <Router>
            <Navi user={this.state.user} sessionChecked={this.state.sessionChecked} hide={this.state.naviHide} />
            <Header />
            <Switch>
              <Route exact path='/'>
                <Redirect to='/home' />
              </Route>
              <Route path='/admin'>
                <AdminPortal postClick={this.postClick} user={this.state.user} />
              </Route>
              <Route path='/create/post'
                render={props => <CreatePost user={this.state.user} {...props} />} />
              <Route path='/login' component={Login} />
              <Route path='/p/:id/r/:idReply'
                render={props => <PostContainer user={this.state.user} naviHide={this.naviHide} {...props} />} />
              <Route path='/p/:id'
                render={props => <PostContainer user={this.state.user} naviHide={this.naviHide} {...props} />} />
              <Route path='/u/:name'
                render={props => <UserContainer postClick={this.postClick} user={this.state.user} {...props} />} />
              <Route path='/home'>
                <TopicContainer postClick={this.postClick} user={this.state.user} />
              </Route>
            </Switch>
            {this.state.post}
            <Toast notifs={this.state.toastPush} toastClear={this.toastClear} />
          </Router>
        </AppContext.Provider>
      </div>
    );
  }
}
