'use client'
import React from "react";

function StreamList() {
    const [streams, setStreams] = React.useState<(string | null)[]>([]);  
    React.useEffect(() => {
      fetch("https://api.firmsnap.com/rtmp/stat")
        .then(resp => resp.text())
        .then(xmlStr => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(xmlStr, "text/xml");
          console.log("Raw XML:", xmlStr);

          const streamNames: (string | null)[] = [];
          const applications = doc.getElementsByTagName("application");
          console.log("Found applications:", applications.length);
          
          for (let i = 0; i < applications.length; i++) {
            const app = applications[i];
            const liveElements = app.getElementsByTagName("live");
            
            for (let j = 0; j < liveElements.length; j++) {
              const live = liveElements[j];
              const streams = live.getElementsByTagName("stream");
              
              for (let k = 0; k < streams.length; k++) {
                const stream = streams[k];
                const nameElement = stream.getElementsByTagName("name")[0];
                if (nameElement && nameElement.textContent) {
                  streamNames.push(nameElement.textContent);
                }
              }
            }
          }
          
          setStreams(streamNames);
        })
        .catch(error => {
          console.error("Error fetching streams:", error);
        });
    }, []);
  
    return (
      <ul>
        {streams.map(name => (
          <li key={name}><a href={`https://api.firmsnap.com/hls/${name}.m3u8`} target="_blank" rel="noopener noreferrer">{name}</a></li>
        ))}
      </ul>
    );
  }
  
  export default StreamList;