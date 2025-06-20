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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { createUser } from "@/helpers/api-communicators"

interface UserAddModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: () => void
}

export function UserAddModal({ isOpen, onClose, onAdd }: UserAddModalProps) {
  const [username, setUsername] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!username.trim()) {
      newErrors.username = "Username is required"
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required"
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
  if (!password.trim()) {
    newErrors.password = "Password is required"
  } else if (!passwordRegex.test(password)) {
    newErrors.password = "Password must be at least 6 characters long and include numbers, symbols, uppercase, and lowercase letters"
  }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddClick = () => {
    if (validateForm()) {
      setIsConfirmDialogOpen(true)
    }
  }

  const handleConfirmAdd = async () => {
    setIsAdding(true)

    try {
      await createUser(username, password, phoneNumber)
      // Call the add function
      onAdd()

      // Reset form
      resetForm()
      // Provide user feedback
    } catch (error) {
      console.error("Error adding user:", error)
      // Set error message
      setErrors((prevErrors) => ({
        ...prevErrors,
        form: "Failed to add user. Please try again."
      }))
    } finally {
      setIsAdding(false)
      setIsConfirmDialogOpen(false)
    }
  }

  const resetForm = () => {
    setUsername("")
    setPhoneNumber("")
    setPassword("")
    setShowPassword(false)
    setErrors({})
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account with the following details.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {errors.form && (
              <div className="bg-red-500 bg-opacity-50 text-white text-center p-2 rounded">
                {errors.form}
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <div className="col-span-3">
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right">
                Phone Number
              </Label>
              <div className="col-span-3">
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={errors.phoneNumber ? "border-red-500" : ""}
                />
                {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <div className="col-span-3 relative">
                <div className="flex items-center">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
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
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleAddClick}>Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={(open) => !isAdding && setIsConfirmDialogOpen(open)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm New User</DialogTitle>
            <DialogDescription>Are you sure you want to create this new user account?</DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <div className="space-y-2">
              <div className="grid grid-cols-3">
                <p className="font-medium">Username:</p>
                <p className="col-span-2">{username}</p>
              </div>
              <div className="grid grid-cols-3">
                <p className="font-medium">Phone Number:</p>
                <p className="col-span-2">{phoneNumber}</p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)} disabled={isAdding}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAdd} disabled={isAdding}>
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

