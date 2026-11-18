'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { userService } from '@/services/user.service';
import type { UserProfile, UserRole } from '@/types';

const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['admin', 'student'] satisfies [UserRole, UserRole]),
  group: z.string().nullable(),
});

const updateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  role: z.enum(['admin', 'student'] satisfies [UserRole, UserRole]).optional(),
  group: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

type CreateUserForm = z.infer<typeof createUserSchema>;
type UpdateUserForm = z.infer<typeof updateUserSchema>;

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  user: UserProfile | null;
}

async function createUser(data: CreateUserForm): Promise<UserProfile> {
  return await userService.createUser(data);
}

async function updateUser({ id, data }: { id: number; data: UpdateUserForm }): Promise<UserProfile> {
  return await userService.updateUser(id, data);
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-status-danger mt-1">{message}</p>;
}

export function UserFormModal({ open, onClose, user }: UserFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!user;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserForm>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema) as any,
    defaultValues: {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'student',
      group: null,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        group: user.group,
        password: '',
      });
    } else {
      reset({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'student',
        group: null,
      });
    }
  }, [user, reset]);

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User created successfully');
      onClose();
    },
    onError: () => {
      toast.error('Failed to create user');
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User updated successfully');
      onClose();
    },
    onError: () => {
      toast.error('Failed to update user');
    },
  });

  const onSubmit = (data: CreateUserForm) => {
    if (isEditing && user) {
      const { password: _, username: __, ...updateData } = data;
      updateMutation.mutate({ id: user.id, data: updateData });
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-background-card border border-border-DEFAULT rounded-2xl shadow-2xl w-full max-w-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border-DEFAULT">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-400" />
                </div>
                <h2 className="font-heading font-semibold text-text-primary">
                  {isEditing ? 'Edit User' : 'Add New User'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-background-elevated transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1.5 block">First Name</label>
                  <Input {...register('firstName')} placeholder="John" />
                  <FieldError message={errors.firstName?.message} />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1.5 block">Last Name</label>
                  <Input {...register('lastName')} placeholder="Doe" />
                  <FieldError message={errors.lastName?.message} />
                </div>
              </div>

              {!isEditing && (
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1.5 block">Username</label>
                  <Input {...register('username')} placeholder="johndoe" />
                  <FieldError message={errors.username?.message} />
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Email</label>
                <Input {...register('email')} type="email" placeholder="john@example.com" />
                <FieldError message={errors.email?.message} />
              </div>

              {!isEditing && (
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1.5 block">Password</label>
                  <Input {...register('password')} type="password" placeholder="Min 8 characters" />
                  <FieldError message={errors.password?.message} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1.5 block">Role</label>
                  <select
                    {...register('role')}
                    className="w-full h-10 px-3 rounded-xl bg-background-elevated border border-border-DEFAULT text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-indigo/50"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                  <FieldError message={errors.role?.message} />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1.5 block">Group</label>
                  <Input {...register('group')} placeholder="e.g. CS-2024" />
                  <FieldError message={errors.group?.message} />
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" isLoading={isPending} loadingText="Saving...">
                  {isEditing ? 'Save Changes' : 'Create User'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
