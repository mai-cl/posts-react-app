import Axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";

const ProfileFollow = ({ action }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { username } = useParams();

  useEffect(() => {
    const request = Axios.CancelToken.source();

    (async function () {
      try {
        const response = await Axios.get(`/profile/${username}/${action}`, {
          cancelToken: request.token,
        });
        setIsLoading(false);
        setUsers(response.data);
      } catch (error) {
        console.log("There was an error or the request was cancelled.");
      }
    })();

    return () => {
      request.cancel();
    };
  }, [username]);

  if (isLoading) return <LoadingDotsIcon />;

  return (
    <div className="list-group">
      {users.map((user, index) => {
        return (
          <Link
            to={`/profile/${user.username}`}
            className="list-group-item list-group-item-action"
            key={index}
          >
            <img className="avatar-tiny" src={user.avatar} />
            {user.username}
          </Link>
        );
      })}
    </div>
  );
};

export default ProfileFollow;
