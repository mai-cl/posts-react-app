import Axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";
import Page from "./Page";

function ViewSinglePost() {
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState({});
  const { id } = useParams();

  const date = new Date(post.createdDate);
  const dateFormatted = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`;

  useEffect(() => {
    const request = Axios.CancelToken.source();

    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${id}`, {
          cancelToken: request.token,
        });
        console.log(response.data);
        setPost(response.data);
        setIsLoading(false);
      } catch (error) {
        console.log("There was an error or the request was cancelled.");
      }
    }

    fetchPost();

    return () => {
      request.cancel();
    };
  }, []);

  if (isLoading)
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    );

  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        <span className="pt-2">
          <a href="#" className="text-primary mr-2" title="Edit">
            <i className="fas fa-edit"></i>
          </a>
          <a className="delete-post-button text-danger" title="Delete">
            <i className="fas fa-trash"></i>
          </a>
        </span>
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by{" "}
        <Link to={`/profile/${post.author.username}`}>
          {post.author.username}
        </Link>{" "}
        on {dateFormatted}
      </p>

      <div className="body-content">{post.body}</div>
    </Page>
  );
}

export default ViewSinglePost;
