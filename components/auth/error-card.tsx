import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { CardWrapper } from "@/components/auth/card-wrapper";

export const ErrorCard = () => {
    return (
        <CardWrapper
            headerLabel="Opps! Something went wrong"
            backButtonLabel="Back to Login"
            backButtonHref="/auth/login">
            <div className="flex w-full justify-center items-center">
                <ExclamationTriangleIcon className="w-10 h-10 text-destructive" />
            </div>
        </CardWrapper>
    );
};
