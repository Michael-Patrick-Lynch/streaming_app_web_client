'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export type Listing = {
  id: string;
  name: string;
  image: string;
  category: string;
  quantity: number;
  price: number;
  listingType: string;
};

export const columns: ColumnDef<Listing>[] = [
  {
    accessorKey: 'name',
    header: 'Product',
    cell: ({ row }) => {
      const listing = row.original;
      return (
        <div className="flex items-center space-x-3">
          <Image
            src={listing.image}
            alt={listing.name}
            width={40}
            height={40}
            className="rounded-md object-cover"
          />
          <span>{listing.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => (
      <div className="text-left">{row.getValue('category')}</div>
    ),
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
    cell: ({ row }) => (
      <div className="text-left">{row.getValue('quantity')}</div>
    ),
  },
  {
    accessorKey: 'price',
    header: 'Price & Format',
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'));
      const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(price);
      return (
        <div className="text-left">
          <div>{formattedPrice}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.listingType}
          </div>
        </div>
      );
    },
  },
];

export function SellerInventoryTable() {
  const [data, setData] = React.useState<Listing[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const router = useRouter();

  React.useEffect(() => {
    async function fetchListings() {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('https://api.firmsnap.com/listings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          console.error('Failed to fetch listings');
          return;
        }
        const json = await response.json();

        const combined = [
          ...(json.buy_it_now || []),
          ...(json.auctions || []),
          ...(json.giveaways || []),
        ];

        const listings: Listing[] = combined.map((l) => ({
          id: l.id,
          name: l.title,
          image:
            l.image ||
            'https://pub-b0d5f024ddc742a2993ac9ca697c41f7.r2.dev/1737945906891-cat.gif',
          category: l.category || 'N/A',
          quantity: l.quantity,
          price: l.price.amount / 100,
          listingType:
            l.type === 'bin'
              ? 'Buy-It-Now'
              : l.type === 'auction'
                ? 'Auction'
                : l.type,
        }));
        setData(listings);
      } catch (error) {
        console.error('Error fetching listings:', error);
      }
    }
    fetchListings();
  }, []);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() =>
                    router.push(`/edit-listing/${row.original.id}`)
                  }
                  className="cursor-pointer hover:bg-muted"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No Listings
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} Listing(s)
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
