'use client';

import { useUser } from '@/context/UserContext';
import { Channel, Socket } from 'phoenix';
import { useEffect, useMemo, useState } from 'react';

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
  const { currentUser } = useUser();

  // userId calculation is using useMemo to prevent it changing on every render
  const userId = useMemo(() => {
    return currentUser
      ? currentUser.id
      : `anon_${Math.floor(Math.random() * 100000)}`;
  }, [currentUser]); // Only recalculate when currentUser changes

  useEffect(() => {
    const socket = new Socket('wss://api.firmsnap.com/socket');
    console.log('Will now attempt to open the socket');
    socket.onOpen(() => console.log('Socket opened.'));
    socket.onClose(() => console.log('Socket closed.'));
    // socket.onError((err) => console.log('Socket error:', err));
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
    <div className="p-4 text-white h-full w-full flex flex-col">
      <h2 className="font-bold mb-2">Live Chat</h2>
      <div className="flex-1 border border-gray-800 p-2 h-96 mb-2">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-1">
            Anon: {msg}
          </div>
        ))}
      </div>
      <div className="flex pb-10">
        <input
          className="flex-1 border border-gray-300 h-10 p-4 text-white max-w-sm bg-black rounded-full"
          type="text"
          placeholder="Type here..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
        />
      </div>
    </div>
  );
}
