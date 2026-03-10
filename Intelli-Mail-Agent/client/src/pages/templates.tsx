import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useTemplates, useCreateTemplate, useDeleteTemplate } from "@/hooks/use-templates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function TemplatesPage() {
  const { data: templates = [], isLoading } = useTemplates();
  const createTemplate = useCreateTemplate();
  const deleteTemplate = useDeleteTemplate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !content) return;
    
    createTemplate.mutate({ name, content }, {
      onSuccess: () => {
        setIsOpen(false);
        setName("");
        setContent("");
      }
    });
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Templates</h1>
          <p className="text-muted-foreground">Manage your email frameworks and tonal guidelines.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
              <Plus className="mr-2 h-4 w-4" /> New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-card border-border/50 shadow-2xl">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Create Template</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">Template Name</label>
                  <Input 
                    id="name" 
                    placeholder="e.g., Formal Intro, Casual Follow-up" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background/50 border-border focus-visible:ring-primary/50"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="content" className="text-sm font-medium text-foreground">Content Guidelines / Base Text</label>
                  <Textarea 
                    id="content" 
                    placeholder="Enter the template instructions for the AI or the base text..." 
                    className="min-h-[200px] resize-none bg-background/50 border-border focus-visible:ring-primary/50"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createTemplate.isPending || !name || !content}
                  className="w-full sm:w-auto"
                >
                  {createTemplate.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Template
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-border/50 rounded-2xl bg-card/20">
          <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-display font-medium text-white mb-2">No templates yet</h3>
          <p className="text-muted-foreground max-w-sm mb-6">Create your first template to guide the AI when generating cold emails.</p>
          <Button variant="outline" onClick={() => setIsOpen(true)}>Create Template</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="bg-card border-white/5 shadow-xl shadow-black/10 flex flex-col hover:border-white/10 transition-colors">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-display truncate pr-8 relative">
                  {template.name}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (confirm("Delete this template?")) {
                        deleteTemplate.mutate(template.id);
                      }
                    }}
                    disabled={deleteTemplate.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
                <CardDescription className="text-xs">
                  Created {template.createdAt ? format(new Date(template.createdAt), "MMM d, yyyy") : 'Recently'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="relative h-32 overflow-hidden rounded-md bg-background/50 border border-border/50 p-4">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed line-clamp-5">
                    {template.content}
                  </p>
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
