interface StreamDescriptionCardProps {
  streamerName: string;
}

export default function StreamDescriptionCard({
  streamerName,
}: StreamDescriptionCardProps) {
  return (
    <div className="p-4 text-white bg-gray-800">
      <h2 className="font-bold mb-2">{streamerName}</h2>
      <button className="ml-2 bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded">
        Subscribe
      </button>
    </div>
  );
}
