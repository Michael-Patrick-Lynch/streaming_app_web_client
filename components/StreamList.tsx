"use client";

import React from "react";

function StreamList() {
  const [streams, setStreams] = React.useState<string[]>([]);

  React.useEffect(() => {
    fetch("https://api.firmsnap.com/stream/get_active")
      .then((res) => res.json())
      .then((data) => {
        // data should be something like: [{ "streamer_username": "michael" }, ...]
        const usernames = data.map((item: { streamer_username: string }) => item.streamer_username);
        setStreams(usernames);
      })
      .catch((error) => {
        console.error("Error fetching streams:", error);
      });
  }, []);

  return (
    <ul>
      {streams.map((name) => (
        <li key={name}>
          <a
            href={`/${name}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {name}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default StreamList;
