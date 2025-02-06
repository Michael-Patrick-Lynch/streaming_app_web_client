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

// Define the Listing type
export type Listing = {
  id: string;
  name: string;
  image: string;
  category: string;
  quantity: number;
  price: number;
  listingType: string;
};

// Create some mock data for your listings
const data: Listing[] = [
  {
    id: 'listing1',
    name: 'Cool Sneakers',
    image:
      'https://pub-b0d5f024ddc742a2993ac9ca697c41f7.r2.dev/1737944807187-LTE_frame%20100%20SNR.png',
    category: 'Shoes',
    quantity: 15,
    price: 79.99,
    listingType: 'Buy-It-Now',
  },
  {
    id: 'listing2',
    name: 'Stylish Jacket',
    image:
      'https://pub-b0d5f024ddc742a2993ac9ca697c41f7.r2.dev/1737944807187-LTE_frame%20100%20SNR.png',
    category: 'Apparel',
    quantity: 5,
    price: 149.99,
    listingType: 'Auction',
  },
  {
    id: 'listing3',
    name: 'Modern Watch',
    image:
      'https://pub-b0d5f024ddc742a2993ac9ca697c41f7.r2.dev/1737944807187-LTE_frame%20100%20SNR.png',
    category: 'Accessories',
    quantity: 20,
    price: 199.99,
    listingType: 'Buy-It-Now',
  },
  {
    id: 'listing4',
    name: 'Elegant Handbag',
    image:
      'https://pub-b0d5f024ddc742a2993ac9ca697c41f7.r2.dev/1737944807187-LTE_frame%20100%20SNR.png',
    category: 'Bags',
    quantity: 8,
    price: 249.99,
    listingType: 'Buy-It-Now',
  },
];

// Update the columns definition
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
    cell: ({ row }) => <div>{row.getValue('category')}</div>,
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
    cell: ({ row }) => <div>{row.getValue('quantity')}</div>,
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
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const router = useRouter();

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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} row(s)
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
