import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Type, Hash, Calendar, Mail, Phone, List, ToggleLeft, CheckSquare } from "lucide-react";
import { Link } from "wouter";

const fieldTypes = [
  { type: "text", label: "Text", icon: Type },
  { type: "number", label: "Number", icon: Hash },
  { type: "date", label: "Date", icon: Calendar },
  { type: "email", label: "Email", icon: Mail },
  { type: "phone", label: "Phone", icon: Phone },
  { type: "select", label: "Select", icon: List },
  { type: "boolean", label: "Boolean", icon: ToggleLeft },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare },
];

const mockFields = [
  { id: "1", entityType: "lead", fieldName: "referral_source", labelEn: "Referral Source", labelAr: "مصدر الإحالة", fieldType: "select", isRequired: false, isActive: true },
  { id: "2", entityType: "company", fieldName: "annual_revenue", labelEn: "Annual Revenue", labelAr: "الإيرادات السنوية", fieldType: "currency", isRequired: false, isActive: true },
  { id: "3", entityType: "lead", fieldName: "preferred_demo_date", labelEn: "Preferred Demo Date", labelAr: "تاريخ العرض المفضل", fieldType: "date", isRequired: false, isActive: true },
  { id: "4", entityType: "contact", fieldName: "linkedin_url", labelEn: "LinkedIn URL", labelAr: "رابط لينكدإن", fieldType: "text", isRequired: false, isActive: false },
  { id: "5", entityType: "opportunity", fieldName: "competitor_name", labelEn: "Competitor", labelAr: "المنافس", fieldType: "text", isRequired: false, isActive: true },
];

const entityTypeColors: Record<string, string> = {
  lead: "text-blue-400 bg-blue-400/10",
  contact: "text-green-400 bg-green-400/10",
  company: "text-purple-400 bg-purple-400/10",
  opportunity: "text-yellow-400 bg-yellow-400/10",
};

export default function FieldsSettingsPage() {
  return (
    <AppShell title="Custom Field Builder">
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="gap-2 h-8">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </Link>
          <Button size="sm" className="gap-2 h-8" data-testid="button-create-field">
            <Plus className="h-3.5 w-3.5" /> New Field
          </Button>
        </div>

        {/* Field Types Reference */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Available Field Types</h3>
          <div className="flex flex-wrap gap-2">
            {fieldTypes.map((ft) => {
              const Icon = ft.icon;
              return (
                <div key={ft.type} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/50 border border-border/50 text-xs">
                  <Icon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-foreground">{ft.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fields List */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Custom Fields</h3>
          <div className="space-y-2">
            {mockFields.map((f) => (
              <Card key={f.id} data-testid={`card-field-${f.id}`} className={!f.isActive ? "opacity-50" : ""}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium capitalize ${entityTypeColors[f.entityType] ?? "text-foreground bg-muted"}`}>
                        {f.entityType}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{f.labelEn}</p>
                        <p className="text-xs text-muted-foreground">{f.labelAr} · <code className="text-[10px]">{f.fieldName}</code> · {f.fieldType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {f.isRequired && <span className="text-[10px] text-red-400">Required</span>}
                      <Button variant="outline" size="sm" className="h-7 text-xs">Edit</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
