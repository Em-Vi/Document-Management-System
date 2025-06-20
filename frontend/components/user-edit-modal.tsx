"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { resetUserPassword } from "@/helpers/api-communicators"

interface UserEditModalProps {
  user: {
    id: string
    username: string
  }
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export function UserEditModal({ user, isOpen, onClose, onUpdate }: UserEditModalProps) {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleSaveClick = () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/

    if (!passwordRegex.test(newPassword)) {
      setErrorMessage("Password must be at least 6 characters long and contain symbols, numbers, lowercase, and uppercase letters")
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match")
      return
    }

    setErrorMessage("")
    setIsConfirmDialogOpen(true)
  }

  const handleConfirmUpdate = async () => {
    setIsUpdating(true)

    try {
      // Simulate API call with a delay
      await resetUserPassword(user.id, newPassword)
      // Call the update function
      onUpdate()
      setConfirmPassword("")
      setNewPassword("")
    } catch (error) {
      console.error("Error resetting password:", error)
      setConfirmPassword("")
      setNewPassword("")
    } finally {
      setIsUpdating(false)
      setIsConfirmDialogOpen(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={()=>{onClose();setConfirmPassword("");
    setNewPassword(""); setErrorMessage("");}}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>Reset password for {user.username}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {errorMessage && (
              <div className="col-span-4 text-center text-red-600 bg-red-100 p-2 rounded-md">
                {errorMessage}
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newPassword" className="text-right">
                New Password
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pr-10"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confirmPassword" className="text-right">
                Confirm Password
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="pr-10"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={()=>{onClose();setConfirmPassword("");
    setNewPassword(""); setErrorMessage("");}}>
              Cancel
            </Button>
            <Button onClick={handleSaveClick}>Reset Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={(open) => !isUpdating && setIsConfirmDialogOpen(open)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Password Reset</DialogTitle>
            <DialogDescription>Are you sure you want to reset the password for this user?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleConfirmUpdate} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

