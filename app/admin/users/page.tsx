'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { Users, Plus, Search, ChevronLeft, ChevronRight, Edit, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserFormModal } from '@/components/admin/users/user-form-modal';
import { userService } from '@/services/user.service';
import type { UserProfile, UserRole } from '@/types';

async function fetchUsers(): Promise<UserProfile[]> {
  const data = await userService.getUsers();
  return data.results;
}

async function deleteUser(id: number): Promise<void> {
  await userService.deleteUser(id);
}

const columnHelper = createColumnHelper<UserProfile>();

const roleBadgeStyle: Record<UserRole, string> = {
  admin: 'bg-accent-indigo/15 text-accent-indigo border border-accent-indigo/30',
  student: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
};

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-14 bg-background-elevated rounded-lg" />
      ))}
    </div>
  );
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: fetchUsers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User deleted successfully');
      setDeleteConfirmId(null);
    },
    onError: () => {
      toast.error('Failed to delete user');
    },
  });

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalFilter(e.target.value);
  }, []);

  const filteredUsers = users.filter((u) => roleFilter === 'all' || u.role === roleFilter);

  const columns = [
    columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
      id: 'name',
      header: 'User',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-accent-indigo to-accent-violet flex items-center justify-center shrink-0 text-white text-sm font-semibold">
            {row.original.firstName?.[0]?.toUpperCase() ?? row.original.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">
              {row.original.firstName} {row.original.lastName}
            </p>
            <p className="text-xs text-text-secondary">@{row.original.username}</p>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: (info) => <span className="text-sm text-text-secondary">{info.getValue()}</span>,
    }),
    columnHelper.accessor('role', {
      header: 'Role',
      cell: (info) => (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${roleBadgeStyle[info.getValue()]}`}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('group', {
      header: 'Group',
      cell: (info) => (
        <span className="text-sm text-text-secondary">{info.getValue() ?? '—'}</span>
      ),
    }),
    columnHelper.accessor('isActive', {
      header: 'Status',
      cell: (info) => (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${info.getValue() ? 'bg-status-success/15 text-status-success border border-status-success/30' : 'bg-status-danger/15 text-status-danger border border-status-danger/30'}`}>
          {info.getValue() ? 'Active' : 'Inactive'}
        </span>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: 'Joined',
      cell: (info) => (
        <span className="text-sm text-text-secondary">
          {format(new Date(info.getValue()), 'MMM d, yyyy')}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-text-secondary hover:text-accent-indigo"
            onClick={() => { setEditUser(row.original); setModalOpen(true); }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-text-secondary hover:text-status-danger"
            onClick={() => setDeleteConfirmId(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: filteredUsers,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-heading font-bold text-text-primary">Users</h1>
            <p className="text-sm text-text-secondary">{users.length} total users</p>
          </div>
        </div>
        <Button onClick={() => { setEditUser(null); setModalOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input
            placeholder="Search users..."
            value={globalFilter}
            onChange={handleSearch}
            className="pl-9"
          />
        </div>

        {/* Role Tabs */}
        <div className="flex gap-1 bg-background-elevated border border-border-DEFAULT rounded-xl p-1">
          {(['all', 'admin', 'student'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                roleFilter === role
                  ? 'bg-accent-indigo text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-background-card border border-border-DEFAULT rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-4"><TableSkeleton /></div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle className="h-10 w-10 text-status-danger" />
            <p className="text-text-secondary">Failed to load users</p>
          </div>
        ) : table.getRowModel().rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Users className="h-10 w-10 text-text-muted" />
            <p className="text-text-secondary text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-border-DEFAULT">
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border-DEFAULT/50 hover:bg-background-elevated/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && table.getRowModel().rows.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-DEFAULT">
            <span className="text-sm text-text-secondary">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <UserFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditUser(null); }}
        user={editUser}
      />

      {/* Delete Confirm Dialog */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background-card border border-border-DEFAULT rounded-2xl p-6 w-full max-w-sm shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-status-danger/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-status-danger" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Delete User</h3>
                <p className="text-sm text-text-secondary">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                isLoading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteConfirmId)}
              >
                Delete
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
