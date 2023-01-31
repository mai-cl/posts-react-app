import React, { useEffect, useReducer } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useImmerReducer } from "use-immer";
import Axios from "axios";
Axios.defaults.baseURL = "http://localhost:8080";

// Components
import Header from "./components/Header";
import HomeGuest from "./components/HomeGuest";
import Footer from "./components/Footer";
import About from "./components/About";
import Terms from "./components/Terms";
import Home from "./components/Home";
import CreatePost from "./components/CreatePost";
import ViewSinglePost from "./components/ViewSinglePost";
import FlashMessages from "./components/FlashMessages";
import Profile from "./components/Profile";

import DispatchContext from "./DispatchContext";
import StateContext from "./StateContext";

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("postsappToken")),
    flashMessages: [],
    user: {
      username: localStorage.getItem("postsappUsername"),
      avatar: localStorage.getItem("postsappAvatar"),
      token: localStorage.getItem("postsappToken"),
    },
  };

  const ourReducer = (draft, action) => {
    switch (action.type) {
      case "login":
        draft.loggedIn = true;
        draft.user.username = action.data.username;
        draft.user.avatar = action.data.avatar;
        draft.user.token = action.data.token;
        return;
      case "logout":
        draft.loggedIn = false;
        return;
      case "addFlashMessage":
        draft.flashMessages.push(action.value);
        return;
      default:
        return draft;
    }
  };

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("postsappUsername", state.user.username);
      localStorage.setItem("postsappAvatar", state.user.avatar);
      localStorage.setItem("postsappToken", state.user.token);
    } else {
      localStorage.removeItem("postsappUsername");
      localStorage.removeItem("postsappAvatar");
      localStorage.removeItem("postsappToken");
    }
  }, [state.loggedIn]);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Routes>
            <Route path="/profile/:username/*" element={<Profile />} />
            <Route
              path="/"
              element={state.loggedIn ? <Home /> : <HomeGuest />}
            />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/post/:id" element={<ViewSinglePost />} />
            <Route path="/about-us" element={<About />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

const root = ReactDOM.createRoot(document.querySelector("#app"));
root.render(<Main />);
