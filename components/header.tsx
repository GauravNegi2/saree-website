"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/contexts/cart-context"
import { Search, ShoppingBag, Heart, User, Menu } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function Header() {
  const { state } = useCart()
  const [wishlistCount] = useState(0)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    const load = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!isMounted) return
      if (authUser) setUser({ id: authUser.id, email: authUser.email || undefined })
      else setUser(null)
    }
    load()

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load()
    })

    return () => {
      isMounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-serif font-bold text-primary">Elegance</div>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex" viewport={false}>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Collections</NavigationMenuTrigger>
                <NavigationMenuContent className="bg-white text-gray-900 border shadow-lg z-50">
                  <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <NavigationMenuLink asChild>
                      <Link
                        href="/collections/silk"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none text-gray-900">Silk Sarees</div>
                        <p className="line-clamp-2 text-sm leading-snug text-gray-600">
                          Premium silk sarees for special occasions
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/collections/cotton"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none text-gray-900">Cotton Sarees</div>
                        <p className="line-clamp-2 text-sm leading-snug text-gray-600">
                          Comfortable everyday wear collection
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/collections/designer"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none text-gray-900">Designer Sarees</div>
                        <p className="line-clamp-2 text-sm leading-snug text-gray-600">
                          Exclusive designer collections
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/collections/bridal"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none text-gray-900">Bridal Sarees</div>
                        <p className="line-clamp-2 text-sm leading-snug text-gray-600">
                          Perfect for your special day
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/collections/festive"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none text-gray-900">Festive Wear</div>
                        <p className="line-clamp-2 text-sm leading-snug text-gray-600">Celebrate in style</p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/collections/casual"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none text-gray-900">Casual Sarees</div>
                        <p className="line-clamp-2 text-sm leading-snug text-gray-600">
                          Effortless everyday elegance
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  href="/new-arrivals"
                  className="inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                >
                  New Arrivals
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  href="/sale"
                  className="inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                >
                  Sale
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-sm mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search sarees..." className="pl-10" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {user ? (
              <Button variant="ghost" size="icon" asChild className="hidden md:flex">
                <Link href="/account">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" size="icon" asChild className="hidden md:flex">
                <Link href="/auth/login">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">{wishlistCount}</Badge>
                )}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <ShoppingBag className="h-5 w-5" />
                {state.itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">{state.itemCount}</Badge>
                )}
              </Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4">
                  {user ? (
                    <Link href="/account" className="text-lg font-medium">
                      My Account
                    </Link>
                  ) : (
                    <>
                      <Link href="/auth/login" className="text-lg font-medium">
                        Sign In
                      </Link>
                      <Link href="/auth/register" className="text-lg font-medium">
                        Create Account
                      </Link>
                    </>
                  )}
                  <Link href="/cart" className="text-lg font-medium">
                    Cart ({state.itemCount})
                  </Link>
                  <Link href="/collections/silk" className="text-lg font-medium">
                    Silk Sarees
                  </Link>
                  <Link href="/collections/cotton" className="text-lg font-medium">
                    Cotton Sarees
                  </Link>
                  <Link href="/collections/designer" className="text-lg font-medium">
                    Designer Sarees
                  </Link>
                  <Link href="/collections/bridal" className="text-lg font-medium">
                    Bridal Sarees
                  </Link>
                  <Link href="/collections/festive" className="text-lg font-medium">
                    Festive Wear
                  </Link>
                  <Link href="/collections/casual" className="text-lg font-medium">
                    Casual Sarees
                  </Link>
                  <Link href="/new-arrivals" className="text-lg font-medium">
                    New Arrivals
                  </Link>
                  <Link href="/sale" className="text-lg font-medium">
                    Sale
                  </Link>
                  <Link href="/wishlist" className="text-lg font-medium">
                    Wishlist ({wishlistCount})
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
