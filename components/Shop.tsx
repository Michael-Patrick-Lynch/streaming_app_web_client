interface ShopProps {
  streamerName: string;
}

// Calls the API to display all of that streamers products
export default function Shop({ streamerName }: ShopProps) {
  return (
    <div className="p-4 text-white bg-gray-800">
      <h2 className="font-bold mb-2">{streamerName}&#39;s Shop</h2>
    </div>
  );
}
