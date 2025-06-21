import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/shadcn/ui/sheet";
import { Menu, X } from "lucide-react";
import { Button } from "@/shadcn/ui/button";
import { NavLinks } from "./nav-links";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = useLocation().pathname;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle></SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-5"
              >
                <X className="h-6 w-6 text-white " />
                <span className="sr-only">Close menu</span>
              </Button>
            </SheetClose>
          </div>
          <nav className="flex flex-col gap-4">
            <NavLinks />
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
