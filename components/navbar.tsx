
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { MainNav } from "@/components/main-nav";
import StoreSwitcher from "@/components/store-switcher";
import prismadb from "@/lib/prismadb";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserButton } from "./auth/user-button";

const Navbar = async () => {
    const user = await currentUser();

    if (!user?.id) {
        redirect("/sign-in");
    }

    const stores = await prismadb.store.findMany({ where: { userId: user?.id } });

    return (
        <div className="border-b">
            <div className="flex h-16 items-center px-4">
                <StoreSwitcher items={stores} />
                <MainNav className="mx-6" />
                <div className="ml-auto flex items-center space-x-4">
                    <ThemeToggle />
                </div>
                <UserButton />
            </div>
        </div>
    );
};

export default Navbar;
