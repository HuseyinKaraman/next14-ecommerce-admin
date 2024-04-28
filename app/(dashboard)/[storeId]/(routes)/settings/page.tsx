import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";
import { SettingsForm } from "./components/settings-form";

interface SettingsPageProps {
  params: {
    storeId: string;
  };
}

const SettingsPage: React.FC<SettingsPageProps> = async ({ params }) => {
    const user = await currentUser();

    if (!user?.id) {
        redirect("/sign-in");
    }

    const store = await prismadb.store.findFirst({
        where: {
            id: params.storeId,
            userId: user.id,
        },
    });

    if (!store) {
        redirect("/");
    }


    return( 
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
              <SettingsForm initialData={store}/>
            </div>
        </div>
    );
};

export default SettingsPage;
