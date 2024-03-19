import prismadb from "@/lib/prismadb";

interface DashboardProps {
    params: {
        storeId: string;
    };
}

const DashboardPage: React.FC<DashboardProps> = async ({ params }) => {
    const store = await prismadb.store.findUnique({
        where: {
            id: params.storeId,
        },
    });

    return <div>Active store : {store?.name}</div>;
};

export default DashboardPage;
