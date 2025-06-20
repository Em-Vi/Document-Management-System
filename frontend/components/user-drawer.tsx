"use client"


import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Users, Upload, LogOut, UserCog, Search, ClipboardList } from "lucide-react"
import { useAuth } from "@/context/Authcontext"
import { useToast } from "@/hooks/use-toast"

interface UserDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function UserDrawer({ isOpen, onClose }: UserDrawerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const auth = useAuth()
  const user = auth?.user
  const isAdmin = user?.role === "admin"
  const { toast } = useToast()

  const handleLogout = () => {
    try{
      auth?.logout()
      
      toast({
        title: "Logout successful",
        description: "You have been signed out.",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was a problem signing you out.",
        variant: "destructive",
      })
      console.error("Logout error:", error)
    } finally {
      router.push("/")
    }
  }
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[280px] sm:w-[350px]">
        <SheetHeader className="pb-6">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <div className="mb-6">
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.name} alt={"/images.png"} />
              <AvatarFallback>{user?.name?.charAt(0) || "H"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-lg">{user?.name || "User"}</p>
              <p className="text-sm text-muted-foreground">{user?.role || "Role"}</p>
                    </div>
                  </div>
                </div>
        <nav className="flex flex-col gap-2">
          <Link href="/dashboard/employees" passHref>
            <Button
              variant={pathname?.includes("/employees") ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={onClose}
            >
              <Users className="mr-2 h-5 w-5" />
              Employee List
            </Button>
          </Link>
          <Link href="/dashboard/upload" passHref>
            <Button
              variant={pathname?.includes("/upload") ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={onClose}
            >
              <Upload className="mr-2 h-5 w-5" />
              Upload Document
            </Button>
          </Link>

          
          <Link href="/dashboard/search" passHref>
            <Button
              variant={pathname?.includes("/search") ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={onClose}
            >
              <Search className="mr-2 h-5 w-5" />
              Advanced Search
            </Button>
          </Link>

          {isAdmin && (<Link href="/dashboard/logs" passHref>
            <Button
              variant={pathname?.includes("/logs") ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={onClose}
            >
              <ClipboardList className="mr-2 h-5 w-5" />
              Log Reports
            </Button>
          </Link>)}

           {/* User Management tab - only visible to admins */}
           {isAdmin && (
            <Link href="/dashboard/users" passHref>
              <Button
                variant={pathname?.includes("/users") ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={onClose}
              >
                <UserCog className="mr-2 h-5 w-5" />
                User Management
              </Button>
            </Link>
          )}

          <div className="mt-auto pt-6">
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}

