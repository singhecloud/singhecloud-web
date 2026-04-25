import { BreadcrumbItem } from "@/types";
import { get, save } from "@/routes/api/bani-stream";
import AppLayout from "@/layouts/app-layout";
import { Head, useForm } from "@inertiajs/react";
import SettingsLayout from "@/layouts/settings/layout";
import HeadingSmall from "@/components/heading-small";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Bani Stream",
        href: get().url,
    },
];

type BaniStreamKey = {
    name: string;
    description: string | null;
    gurdwara_sahib: boolean;
};

export default function BaniStream({
    baniStreamKey,
}: {
    baniStreamKey: BaniStreamKey | null;
}) {
    const { data, setData, post, processing, errors } = useForm({
        name: baniStreamKey?.name ?? "",
        description: baniStreamKey?.description ?? "",
        gurdwara_sahib: baniStreamKey?.gurdwara_sahib ?? false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(save().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bani Stream settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Bani Stream"
                        description="Manage your Bani Stream API access and settings."
                    />

                    <form onSubmit={submit} className="space-y-6 rounded-lg border p-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                placeholder="e.g. ds"
                            />
                            {errors.name && (
                                <p className="text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                onChange={(e: any) =>
                                    setData("description", e.target.value)
                                }
                                placeholder="e.g. Darbar Sahib"
                                value={data.description}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-600">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center space-x-3">
                            <Checkbox
                                id="gurdwara_sahib"
                                checked={data.gurdwara_sahib}
                                onCheckedChange={(checked) =>
                                    setData("gurdwara_sahib", checked === true)
                                }
                            />
                            <Label htmlFor="gurdwara_sahib">
                                Gurdwara Sahib account
                            </Label>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button type="submit" disabled={processing}>
                                {processing
                                    ? "Saving..."
                                    : baniStreamKey
                                      ? "Update settings"
                                      : "Save settings"}
                            </Button>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
