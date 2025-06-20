"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Ban, Trash2, AlertCircle, UserPlus, Key } from "lucide-react"
import { UserEditModal } from "@/components/user-edit-modal"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { changeUserStatus, deleteUser, fetchAllUsers } from "@/helpers/api-communicators"
import { UserAddModal } from "@/components/user-add-modal"
import { useAuth } from "@/context/Authcontext"
import { useRouter } from "next/navigation"

type User = { id: string; username: string; phone: string; created_at: string; status: string; }

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSuspending, setIsSuspending] = useState(false)

  const router = useRouter()
  const auth = useAuth()
    
    useEffect(() => {  
      // Check if user is admin
      if (!auth?.user || auth?.user?.role != "admin") {
        router.push("/")
      }
    }, [router])
    

    // Fetch users from the API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
              const usersData = await fetchAllUsers();
              setUsers(usersData);
            } catch (error) {
              console.error("Error fetching users:", error);
            }
          };
      
          fetchUsers();
        }, [isAddModalOpen,isDeleteDialogOpen,isEditModalOpen,isSuspendDialogOpen]);
      


  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchTerm.toLowerCase()),
  )


  const handleAddUserClick = () => {
    setIsAddModalOpen(true)
  }

  const handleDeleteClick = (e: React.MouseEvent, user: any) => {
    e.stopPropagation()
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  const handleSuspendClick = (e: React.MouseEvent, user: any) => {
    e.stopPropagation()
    setSelectedUser(user)
    setIsSuspendDialogOpen(true)
  }

  const handleResetPasswordClick = (e: React.MouseEvent, user: any) => {
    e.stopPropagation()
    setSelectedUser(user)
    setIsEditModalOpen(true)
    console.log(`Reset password for user: ${user.username}`)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)

    try {
      await deleteUser(selectedUser.id)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Error deleting user")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSuspendConfirm = async () => {
    setIsSuspending(true)

    try {
      await changeUserStatus(selectedUser.id, selectedUser.status === "Active" ? "Suspended" : "Active")
      setIsSuspendDialogOpen(false)
    } catch (error) {
      console.error("Error suspending user:", error)
      alert("Error suspending user")
    } finally {
      setIsSuspending(false)
    }
  }

  const handleUserUpdate = () => {
    setIsEditModalOpen(false)
  }

  const handleUserAdd = () => {  
    setIsAddModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage system users and their permissions</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleAddUserClick} className="bg-green-500 hover:bg-green-600 text-white">
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>UID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer hover:bg-muted/50"
                  
                >
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.created_at}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "Active" ? "default" : "secondary"}>{user.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleSuspendClick(e, user)}
                        className="text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                        aria-label={user.status === "Active" ? "Suspend user" : "Activate user"}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteClick(e, user)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        aria-label="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleResetPasswordClick(e, user)}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        aria-label="Reset password"
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* User Edit Modal */}
      {selectedUser && (
        <UserEditModal
          user={selectedUser}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUserUpdate}
        />
      )}
    
      {/* User Add Modal */}
      <UserAddModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleUserAdd} />
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => !isDeleting && setIsDeleteDialogOpen(open)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm User Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">Warning: This will permanently remove the user and all associated data.</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
                  Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Confirmation Dialog */}
      <Dialog open={isSuspendDialogOpen} onOpenChange={(open) => !isSuspending && setIsSuspendDialogOpen(open)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedUser?.status === "Active" ? "Suspend User" : "Activate User"}</DialogTitle>
            <DialogDescription>
              {selectedUser?.status === "Active"
                ? "Are you sure you want to suspend this user? They will not be able to access the system."
                : "Are you sure you want to activate this user? They will regain access to the system."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsSuspendDialogOpen(false)} disabled={isSuspending}>
              Cancel
            </Button>
            <Button
              variant={selectedUser?.status === "Active" ? "destructive" : "default"}
              className={selectedUser?.status === "Active" ? "bg-amber-500 hover:bg-amber-600" : ""}
              onClick={handleSuspendConfirm}
              disabled={isSuspending}
            >
              {isSuspending ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
                  {selectedUser?.status === "Active" ? "Suspending..." : "Activating..."}
                </>
              ) : selectedUser?.status === "Active" ? (
                "Suspend User"
              ) : (
                "Activate User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

