"use client";

import React from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createProject } from "@/lib/api/project";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const Schema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
});
type Values = z.infer<typeof Schema>;

export default function CreateProjectDialog({
  workspaceId,
  canCreate,
  onCreated,
}: {
  workspaceId: string;
  canCreate: boolean;
  onCreated: () => void;
}) {
  const [open, setOpen] = React.useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(Schema),
    defaultValues: { name: "", description: "" },
  });

  async function onSubmit(values: Values) {
    try {
      await createProject({ workspaceId, name: values.name, description: values.description || undefined });
      toast.success("Project created");
      setOpen(false);
      form.reset({ name: "", description: "" });
      onCreated();
    } catch (e: any) {
      toast.error(e?.message ?? "Create project failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!canCreate}>Create project</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input placeholder="Project name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Optional" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating…" : "Create"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
