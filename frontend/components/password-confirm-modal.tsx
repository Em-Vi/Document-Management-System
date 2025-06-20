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
import { useToast } from "@/hooks/use-toast"
import { verifyPassword } from "@/helpers/api-communicators" // Import the new function

interface PasswordConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  employeeName: string
  singleFileMode?: boolean // New prop
}

export function PasswordConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  employeeName,
  singleFileMode
}: PasswordConfirmModalProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [isConfirming, setIsConfirming] = useState(false)
  const { toast } = useToast()

  const handlePasswordConfirm = async () => {
    if (!password.trim()) {
      setPasswordError("Please enter your password")
      return
    }
    
    setIsConfirming(true)
    
    try {
      // Verify password with API instead of hardcoded check
      const isPasswordValid = await verifyPassword(password);
      
      if (isPasswordValid) {
        // Password is correct, proceed with download
        await onConfirm()
        
        // Reset password and close modal
        setPassword("")
        onClose()
      } else {
        // Password is incorrect
        setPasswordError("Invalid password. Please try again.")
        toast({
          title: "Authentication Failed",
          description: "The password you entered is incorrect.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error during password confirmation:", error)
      setPasswordError("An error occurred. Please try again.")
      toast({
        title: "Authentication Error",
        description: "Failed to verify your password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConfirming(false)
    }
  }

  const handleClose = () => {
    setPassword("")
    setPasswordError("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isConfirming && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Download</DialogTitle>
          <DialogDescription>
            Please enter your password to download 
            {singleFileMode ? " this document" : ` all documents for ${employeeName}`}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {passwordError && (
            <div className="bg-red-500 bg-opacity-50 text-white text-center p-2 rounded">
              {passwordError}
            </div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="confirm-password" className="text-right">
              Password
            </Label>
            <div className="col-span-3 relative">
              <div className="flex items-center">
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={isConfirming}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePasswordConfirm} 
            disabled={isConfirming}
          >
            {isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}