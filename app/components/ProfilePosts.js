import Axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";

const ProfilePosts = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { username } = useParams();

  useEffect(() => {
    const request = Axios.CancelToken.source();

    (async function () {
      try {
        const response = await Axios.get(`/profile/${username}/posts`, {
          cancelToken: request.token,
        });
        setIsLoading(false);
        setPosts(response.data);
      } catch (error) {
        console.log("There was an error or the request was cancelled.");
      }
    })();

    return () => {
      request.cancel();
    };
  }, []);

  if (isLoading) return <LoadingDotsIcon />;

  return (
    <div className="list-group">
      {posts.map((post) => {
        const date = new Date(post.createdDate);
        const dateFormatted = `${
          date.getMonth() + 1
        }/${date.getDate()}/${date.getFullYear()}`;

        return (
          <Link
            to={`/post/${post._id}`}
            className="list-group-item list-group-item-action"
            key={post._id}
          >
            <img className="avatar-tiny" src={post.author.avatar} />{" "}
            <strong>{post.title}</strong>
            <span className="text-muted small"> on {dateFormatted} </span>
          </Link>
        );
      })}
    </div>
  );
};

export default ProfilePosts;
