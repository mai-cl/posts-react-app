import Axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useImmerReducer } from "use-immer";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";

import LoadingDotsIcon from "./LoadingDotsIcon";
import NotFound from "./NotFound";
import Page from "./Page";

function EditPost() {
  const originalState = {
    title: {
      value: "",
      hasErrors: false,
      message: "",
    },
    body: {
      value: "",
      hasErrors: false,
      message: "",
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false,
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case "fetchComplete":
        draft.title.value = action.value.title;
        draft.body.value = action.value.body;
        draft.isFetching = false;
        return;
      case "titleChange":
        draft.title.value = action.value;
        draft.title.hasErrors = false;
        return;
      case "bodyChange":
        draft.body.value = action.value;
        draft.body.hasErrors = false;
        return;
      case "submitRequest":
        draft.sendCount++;
        return;
      case "saveRequestStarted":
        draft.isSaving = true;
        return;
      case "saveRequestFinished":
        draft.isSaving = false;
        return;
      case "setTitleError":
        draft.title.hasErrors = action.value.hasErrors;
        draft.title.message = action.value.message;
        return;
      case "setBodyError":
        draft.body.hasErrors = action.value.hasErrors;
        draft.body.message = action.value.message;
        return;
      case "notFound":
        draft.notFound = true;
        return;
      default:
        return;
    }
  }

  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const [state, dispatch] = useImmerReducer(ourReducer, originalState);
  const navigate = useNavigate();

  function submitHandler(e) {
    e.preventDefault();
    checkTitleError(state.title.value);
    checkBodyError(state.body.value);
    dispatch({ type: "submitRequest" });
  }

  function checkTitleError(input) {
    if (!input.trim()) {
      return dispatch({
        type: "setTitleError",
        value: {
          hasErrors: true,
          message: "You must provide a title.",
        },
      });
    }
    dispatch({
      type: "setTitleError",
      value: {
        hasErrors: false,
        message: "",
      },
    });
  }

  function checkBodyError(input) {
    if (!input.trim()) {
      return dispatch({
        type: "setBodyError",
        value: {
          hasErrors: true,
          message: "You must provide a body",
        },
      });
    }
    dispatch({
      type: "setBodyError",
      value: {
        hasErrors: false,
        message: "",
      },
    });
  }

  useEffect(() => {
    const request = Axios.CancelToken.source();

    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${state.id}`, {
          cancelToken: request.token,
        });

        if (response.data) {
          dispatch({ type: "fetchComplete", value: response.data });

          if (appState.user.username != response.data.author.username) {
            appDispatch({
              type: "addFlashMessage",
              value: "You do not have permission to edit that post.",
            });
            navigate("/");
          }
        } else {
          dispatch({ type: "notFound" });
        }
      } catch (error) {
        console.log("There was an error or the request was cancelled.");
      }
    }

    fetchPost();

    return () => {
      request.cancel();
    };
  }, []);

  useEffect(() => {
    if (!state.sendCount) return;
    if (state.title.hasErrors || state.body.hasErrors) return;

    dispatch({ type: "saveRequestStarted" });
    const request = Axios.CancelToken.source();

    async function fetchPost() {
      try {
        const response = await Axios.post(
          `/post/${state.id}/edit`,
          {
            title: state.title.value,
            body: state.body.value,
            token: appState.user.token,
          },
          {
            cancelToken: request.token,
          }
        );

        dispatch({ type: "saveRequestFinished" });
        appDispatch({
          type: "addFlashMessage",
          value: "Congrats! The post was updated.",
        });
      } catch (error) {
        console.log("There was an error or the request was cancelled.");
      }
    }

    fetchPost();
    return () => {
      request.cancel();
    };
  }, [state.sendCount]);

  if (state.notFound) return <NotFound />;

  if (state.isFetching)
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    );

  return (
    <Page title="Edit Post">
      <Link className="small font-weight-bold" to={`/post/${state.id}`}>
        &laquo; Back to post permalink
      </Link>
      <form className="mt-3" onSubmit={submitHandler}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input
            autoFocus
            name="title"
            id="post-title"
            className="form-control form-control-lg form-control-title"
            type="text"
            placeholder=""
            autoComplete="off"
            value={state.title.value}
            onChange={(e) =>
              dispatch({ type: "titleChange", value: e.target.value })
            }
            onBlur={(e) => checkTitleError(e.target.value)}
          />
          {state.title.hasErrors && (
            <div className="alert alert-danger small liveValidateMessage">
              {state.title.message}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea
            name="body"
            id="post-body"
            className="body-content tall-textarea form-control"
            type="text"
            value={state.body.value}
            onChange={(e) =>
              dispatch({ type: "bodyChange", value: e.target.value })
            }
            onBlur={(e) => checkBodyError(e.target.value)}
          ></textarea>
          {state.body.hasErrors && (
            <div className="alert alert-danger small liveValidateMessage">
              {state.body.message}
            </div>
          )}
        </div>

        <button className="btn btn-primary" disabled={state.isSaving}>
          {state.isSaving ? "Saving..." : "Save Updates"}
        </button>
      </form>
    </Page>
  );
}

export default EditPost;
