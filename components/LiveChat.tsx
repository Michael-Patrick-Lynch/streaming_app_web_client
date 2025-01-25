'use client';

import { useUser } from '@/context/UserContext';
import { Channel, Socket, Presence } from 'phoenix';
import { useEffect, useState } from 'react';

interface LiveChatProps {
  streamerName: string;
}

interface MessagePayload {
  body: string;
}

export default function LiveChat({ streamerName }: LiveChatProps) {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [channel, setChannel] = useState<Channel | null>(null);
  const [liveViewerCount, setLiveViewerCount] = useState<number>(0);
  const { currentUser } = useUser();
  const userId = currentUser
    ? currentUser.id
    : `anon_${Math.floor(Math.random() * 100000)}`;

  useEffect(() => {
    const socket = new Socket('wss://api.firmsnap.com/socket');
    console.log('Will now attempt to open the socket');
    socket.onOpen(() => console.log('Socket opened.'));
    socket.onClose(() => console.log('Socket closed.'));
    socket.onError((err) => console.log('Socket error:', err));
    socket.connect();

    // Join the channel for this streamer
    const c = socket.channel(`streamer:${streamerName}`, { user_id: userId });
    c.join()
      .receive('ok', (resp: Record<string, unknown>) => {
        console.log('Joined streamer channel successfully:', resp);
      })
      .receive('error', (resp: Record<string, unknown>) => {
        console.error('Unable to join streamer channel:', resp);
      });

    // Listen for new messages
    c.on('new_msg', (payload: MessagePayload) => {
      setMessages((prev) => [...prev, payload.body]);
    });

    // --- PRESENCE SETUP ---
    const presence = new Presence(c);
    presence.onSync(() => {
      const presenceList = presence.list();
      setLiveViewerCount(Object.keys(presenceList).length);
    });

    setChannel(c);

    // Cleanup when unmounting or streamerName changes
    return () => {
      c.leave();
      socket.disconnect();
    };
  }, [streamerName, userId]);

  const handleSend = () => {
    if (!channel || !inputValue.trim()) return;
    channel.push('new_msg', { body: inputValue });
    setInputValue('');
  };

  return (
    <div className="p-4 text-white bg-gray-800 h-full">
      <h2 className="font-bold mb-2">Live Chat for: {streamerName}</h2>
      {/* Display the viewer count */}
      <div className="mb-2">
        <span>Current Viewers: {liveViewerCount}</span>
      </div>
      <div className="border border-gray-700 p-2 h-48 overflow-y-auto mb-2">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-1">
            {msg}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          className="flex-1 border border-gray-700 p-1 text-black max-w-sm"
          type="text"
          placeholder="Say something..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          className="ml-2 bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}
