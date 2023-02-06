import Axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useParams, NavLink, Routes, Route } from "react-router-dom";
import { useImmer } from "use-immer";
import StateContext from "../StateContext";

import Page from "./Page";
import ProfileFollow from "./ProfileFollow";

import ProfilePosts from "./ProfilePosts";

const Profile = () => {
  const { username } = useParams();
  const appState = useContext(StateContext);

  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData: {
      profileUsername: "...",
      profileAvatar: "https://gravatar.com/avatar/placeholder?s=128",
      isFollowing: false,
      counts: {
        postCount: "",
        followerCount: "",
        followingCount: "",
      },
    },
  });

  useEffect(() => {
    const request = Axios.CancelToken.source();

    (async function () {
      try {
        const response = await Axios.post(
          `/profile/${username}`,
          {
            token: appState.user.token,
          },
          {
            cancelToken: request.token,
          }
        );
        /* setProfileData(response.data); */
        setState((draft) => {
          draft.profileData = response.data;
        });
      } catch (error) {
        console.log("There was an error or the request was cancelled.");
      }
    })();
    return () => {
      request.cancel();
    };
  }, [username]);

  useEffect(() => {
    if (state.startFollowingRequestCount) {
      setState((draft) => {
        draft.followActionLoading = true;
      });

      const request = Axios.CancelToken.source();

      (async function () {
        try {
          const response = await Axios.post(
            `/addFollow/${state.profileData.profileUsername}`,
            {
              token: appState.user.token,
            },
            {
              cancelToken: request.token,
            }
          );

          setState((draft) => {
            draft.profileData.isFollowing = true;
            draft.profileData.counts.followerCount++;
            draft.followActionLoading = false;
          });
        } catch (error) {
          console.log("There was an error or the request was cancelled.");
        }
      })();
      return () => {
        request.cancel();
      };
    }
  }, [state.startFollowingRequestCount]);

  useEffect(() => {
    if (state.stopFollowingRequestCount) {
      setState((draft) => {
        draft.followActionLoading = true;
      });

      const request = Axios.CancelToken.source();

      (async function () {
        try {
          const response = await Axios.post(
            `/removeFollow/${state.profileData.profileUsername}`,
            {
              token: appState.user.token,
            },
            {
              cancelToken: request.token,
            }
          );

          setState((draft) => {
            draft.profileData.isFollowing = false;
            draft.profileData.counts.followerCount--;
            draft.followActionLoading = false;
          });
        } catch (error) {
          console.log("There was an error or the request was cancelled.");
        }
      })();
      return () => {
        request.cancel();
      };
    }
  }, [state.stopFollowingRequestCount]);

  function shouldRenderFollowBtn() {
    return (
      appState.loggedIn &&
      !state.profileData.isFollowing &&
      appState.user.username != state.profileData.profileUsername &&
      state.profileData.profileUsername != "..."
    );
  }

  function shouldRenderStopFollowingBtn() {
    return (
      appState.loggedIn &&
      state.profileData.isFollowing &&
      appState.user.username != state.profileData.profileUsername &&
      state.profileData.profileUsername != "..."
    );
  }

  function startFollowing() {
    setState((draft) => {
      draft.startFollowingRequestCount++;
    });
  }

  function stopFollowing() {
    setState((draft) => {
      draft.stopFollowingRequestCount++;
    });
  }

  return (
    <Page title="Profile Screen">
      <h2>
        <img className="avatar-small" src={state.profileData.profileAvatar} />{" "}
        {state.profileData.profileUsername}
        {shouldRenderFollowBtn() && (
          <button
            onClick={startFollowing}
            disabled={state.followActionLoading}
            className="btn btn-primary btn-sm ml-2"
          >
            Follow <i className="fas fa-user-plus"></i>
          </button>
        )}
        {shouldRenderStopFollowingBtn() && (
          <button
            onClick={stopFollowing}
            disabled={state.followActionLoading}
            className="btn btn-danger btn-sm ml-2"
          >
            Stop Following <i className="fas fa-user-times"></i>
          </button>
        )}
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink to="" end className="nav-item nav-link">
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink to="followers" className="nav-item nav-link">
          Followers: {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink to="following" className="nav-item nav-link">
          Following: {state.profileData.counts.followingCount}
        </NavLink>
      </div>

      <Routes>
        <Route path="" element={<ProfilePosts />} />
        <Route
          path="followers"
          element={<ProfileFollow action="followers" />}
        />
        <Route
          path="following"
          element={<ProfileFollow action="following" />}
        />
      </Routes>
    </Page>
  );
};

export default Profile;
