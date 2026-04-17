import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, MessageSquare, FolderOpen } from "lucide-react";
import { Link } from "wouter";

const mockTemplates = [
  { id: "1", name: "Welcome - New Lead", nameAr: "ترحيب - عميل جديد", category: "Welcome", channel: "whatsapp", body: "مرحبًا {{name}}! شكرًا لتواصلك مع مفوتر. كيف يمكننا مساعدتك اليوم؟", usageCount: 234, requiresApproval: true, isActive: true },
  { id: "2", name: "Demo Confirmation", nameAr: "تأكيد العرض", category: "Scheduling", channel: "all", body: "Hi {{name}}, your demo is confirmed for {{date}} at {{time}}. Looking forward to it!", usageCount: 89, requiresApproval: false, isActive: true },
  { id: "3", name: "Follow Up - No Response", nameAr: "متابعة - بدون رد", category: "Follow-up", channel: "whatsapp", body: "مرحبًا {{name}}، لاحظنا أنك لم ترد على رسالتنا السابقة. هل لديك أي استفسار نساعدك فيه؟", usageCount: 156, requiresApproval: false, isActive: true },
  { id: "4", name: "Payment Reminder", nameAr: "تذكير بالسداد", category: "Billing", channel: "whatsapp", body: "مرحبًا {{name}}، هذا تذكير بأن فاتورتك مستحقة بتاريخ {{due_date}}.", usageCount: 45, requiresApproval: true, isActive: true },
  { id: "5", name: "Inactive Lead Re-engage", nameAr: "إعادة تفعيل عميل", category: "Re-engagement", channel: "all", body: "Hi {{name}}, we have new features that might interest you...", usageCount: 12, requiresApproval: true, isActive: false },
];

const folders = ["Welcome", "Scheduling", "Follow-up", "Billing", "Re-engagement", "Onboarding"];

export default function TemplatesSettingsPage() {
  return (
    <AppShell title="Message Templates">
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="gap-2 h-8">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </Link>
          <Button size="sm" className="gap-2 h-8" data-testid="button-create-template">
            <Plus className="h-3.5 w-3.5" /> New Template
          </Button>
        </div>

        {/* Folders */}
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" className="h-7 text-xs gap-1.5">
            <FolderOpen className="h-3 w-3" /> All ({mockTemplates.length})
          </Button>
          {folders.map((f) => (
            <Button key={f} variant="outline" size="sm" className="h-7 text-xs gap-1.5">
              <FolderOpen className="h-3 w-3" /> {f}
            </Button>
          ))}
        </div>

        {/* Templates */}
        <div className="space-y-2">
          {mockTemplates.map((t) => (
            <Card key={t.id} data-testid={`card-template-${t.id}`} className={!t.isActive ? "opacity-50" : ""}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{t.name}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t.channel}</span>
                      {t.requiresApproval && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400">Needs Approval</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.nameAr}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1 font-mono">{t.body}</p>
                    <p className="text-xs text-muted-foreground mt-1">Used {t.usageCount} times · {t.category}</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-xs shrink-0">Edit</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
