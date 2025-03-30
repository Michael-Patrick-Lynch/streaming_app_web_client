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
import Image from 'next/image';

export type Sale = {
  id: string;
  listing_title: string;
  listing_picture_url: string;
  quantity: number;
  final_price_for_items: {
    amount: number;
    currency: string;
  };
  final_price_for_shipping: {
    amount: number;
    currency: string;
  };
  status: 'pending_delivery' | 'delivered' | 'refunded' | 'under_dispute';
  buyer_addr_line1: string;
  buyer_addr_line2: string | null;
  buyer_addr_city: string;
  buyer_addr_state: string;
  buyer_addr_postal_code: string;
  buyer_addr_country: string;
  tracking_number: string | null;
  carrier: string | null;
};

export const columns: ColumnDef<Sale>[] = [
  {
    accessorKey: 'listing_title',
    header: 'Product',
    cell: ({ row }) => {
      const sale = row.original;
      return (
        <div className="flex items-center space-x-3">
          <Image
            src={
              sale.listing_picture_url ||
              'https://pub-b0d5f024ddc742a2993ac9ca697c41f7.r2.dev/1737945906891-cat.gif'
            }
            alt={sale.listing_title}
            width={40}
            height={40}
            className="rounded-md object-cover"
          />
          <span>{sale.listing_title}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
    cell: ({ row }) => (
      <div className="text-left">{row.getValue('quantity')}</div>
    ),
  },
  {
    accessorKey: 'final_price_for_items',
    header: 'Price',
    cell: ({ row }) => {
      const price = row.original.final_price_for_items;
      const shipping = row.original.final_price_for_shipping;

      const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: price.currency,
      }).format(price.amount / 100);

      const formattedShipping = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: shipping.currency,
      }).format(shipping.amount / 100);

      return (
        <div className="text-left">
          <div>{formattedPrice}</div>
          <div className="text-sm text-muted-foreground">
            + {formattedShipping} shipping
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <div className="text-left capitalize">{status.replace('_', ' ')}</div>
      );
    },
  },
  {
    accessorKey: 'shipping',
    header: 'Shipping To',
    cell: ({ row }) => {
      const sale = row.original;
      return (
        <div className="text-left">
          <div>{sale.buyer_addr_line1}</div>
          {sale.buyer_addr_line2 && (
            <div className="text-sm">{sale.buyer_addr_line2}</div>
          )}
          <div className="text-sm">
            {sale.buyer_addr_city}, {sale.buyer_addr_state}
          </div>
          <div>{sale.buyer_addr_postal_code}</div>
          <div className="text-sm">{sale.buyer_addr_country}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'tracking',
    header: 'Tracking',
    cell: ({ row }) => {
      const sale = row.original;
      return (
        <div className="text-left">
          {sale.tracking_number ? (
            <>
              <div>{sale.carrier}</div>
              <div className="text-sm text-muted-foreground">
                {sale.tracking_number}
              </div>
            </>
          ) : (
            <span className="text-muted-foreground">Not shipped</span>
          )}
        </div>
      );
    },
  },
];

export function SellerSalesTable() {
  const [data, setData] = React.useState<Sale[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  React.useEffect(() => {
    async function fetchSales() {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(
          'https://api.firmsnap.com/sales/as_seller',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          console.error('Failed to fetch sales');
          return;
        }
        const json = await response.json();
        setData(json.sales);
      } catch (error) {
        console.error('Error fetching sales:', error);
      }
    }
    fetchSales();
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
                <TableRow key={row.id} className="hover:bg-muted">
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
                  No Sales
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} Sale(s)
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
