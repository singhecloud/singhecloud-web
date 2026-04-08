import { BreadcrumbItem } from "@/types";
import { keys as apiKeys } from "@/routes/api";
import { create as keyCreate } from "@/routes/api/keys";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, usePage } from "@inertiajs/react";
import SettingsLayout from "@/layouts/settings/layout";
import HeadingSmall from "@/components/heading-small";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Api Keys',
        href: apiKeys().url,
    },
];

type Flash = {
    type?: string;
    data?: any;
};

type PageProps = {
    flash?: Flash;
};

export default function ApiKeys({hasToken}: {hasToken: boolean}) {
    const { props } = usePage<PageProps>();
    const flash = props.flash;
    const flashToken = flash?.type === 'api_token' ? flash.data : null;
    const [copied, setCopied] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Api Keys" description="Get api keys for Gurbani Explorer" />
                    <Link
                        href={keyCreate()}
                        as="button"
                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                    >
                        {hasToken ? "Regenerate api token" : "Get api token"}
                    </Link>

                    {flashToken && (
                        <div className="space-y-3 rounded-lg border p-4">
                            <div className="text-sm font-medium text-red-600">
                                This API token is shown only once. Please copy and store it securely.
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={flashToken}
                                    readOnly
                                    className="w-full rounded-md border px-3 py-2 text-sm font-mono"
                                />

                                <Button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(flashToken);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    }}
                                >
                                    {copied ? "Copied!" : "Copy"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}