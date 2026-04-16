import { useRoute, Link } from "wouter";
import { AppShell } from "@/components/layout/AppShell";
import {
  useGetLead, useUpdateLead, useScoreLeadAi, useGetLeadTimeline,
  getGetLeadQueryKey, getGetLeadTimelineQueryKey,
} from "@workspace/api-client-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ScoreBadge } from "@/components/shared/ScoreBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Zap, Phone, Mail, MapPin, Building2, Clock } from "lucide-react";

export default function LeadDetailPage() {
  const [, params] = useRoute("/leads/:id");
  const id = params?.id ?? "";
  const { toast } = useToast();

  const { data: lead, isLoading } = useGetLead(id, {
    query: { enabled: !!id, queryKey: getGetLeadQueryKey(id) },
  });

  const { data: timeline } = useGetLeadTimeline(id, {
    query: { enabled: !!id, queryKey: getGetLeadTimelineQueryKey(id) },
  });

  const scoreAi = useScoreLeadAi();

  async function handleAiScore() {
    try {
      await scoreAi.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getGetLeadQueryKey(id) });
      toast({ title: "AI scoring complete" });
    } catch {
      toast({ title: "Scoring failed", variant: "destructive" });
    }
  }

  if (isLoading) {
    return (
      <AppShell title="Lead">
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </AppShell>
    );
  }

  if (!lead) {
    return (
      <AppShell title="Lead Not Found">
        <div className="text-center py-20">
          <p className="text-muted-foreground">Lead not found</p>
          <Link href="/leads"><Button variant="ghost" className="mt-4">Back to Leads</Button></Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={`Lead: ${lead.leadCode}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link href="/leads">
              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-back">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-primary">{lead.leadCode}</span>
                <StatusBadge status={lead.leadStatus} />
                <ScoreBadge grade={lead.scoreGrade} score={lead.aiLeadScore} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Created {new Date(lead.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button
            data-testid="button-ai-score"
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={handleAiScore}
            disabled={scoreAi.isPending}
          >
            <Zap className="h-3.5 w-3.5 text-yellow-400" />
            {scoreAi.isPending ? "Scoring..." : "AI Score"}
          </Button>
        </div>

        {/* Header info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Company</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lead.company ? (
                <>
                  <p className="text-sm font-semibold text-foreground">{lead.company.companyName}</p>
                  {lead.company.businessType && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> {lead.company.businessType}
                    </p>
                  )}
                  {lead.company.city && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {lead.company.city}, {lead.company.country}
                    </p>
                  )}
                  {lead.company.companySize && (
                    <p className="text-xs text-muted-foreground">{lead.company.companySize} employees</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No company linked</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Primary Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lead.primaryContact ? (
                <>
                  <p className="text-sm font-semibold text-foreground">{lead.primaryContact.fullName}</p>
                  {lead.primaryContact.jobTitle && (
                    <p className="text-xs text-muted-foreground">{lead.primaryContact.jobTitle}</p>
                  )}
                  {lead.primaryContact.phone && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {lead.primaryContact.phone}
                    </p>
                  )}
                  {lead.primaryContact.email && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {lead.primaryContact.email}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No contact linked</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Qualification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <StatusBadge status={lead.qualificationStatus} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">MQL</span>
                <span className={`text-xs font-medium ${lead.isMql ? "text-green-400" : "text-muted-foreground"}`}>
                  {lead.isMql ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">SQL</span>
                <span className={`text-xs font-medium ${lead.isSql ? "text-green-400" : "text-muted-foreground"}`}>
                  {lead.isSql ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Source</span>
                <span className="text-xs text-foreground">{lead.leadSource ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Assigned To</span>
                <span className="text-xs text-foreground">{lead.assignedUser?.name ?? "-"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Summary */}
        {lead.aiSummary && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">AI Summary</p>
                  <p className="text-sm text-muted-foreground">{lead.aiSummary}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {lead.tags && lead.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {lead.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="activities">
          <TabsList className="bg-muted/30">
            <TabsTrigger value="activities" className="text-xs">Activities ({lead.activities?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="notes" className="text-xs">Notes ({lead.notes?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="opportunities" className="text-xs">Opportunities ({lead.opportunities?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="activities" className="mt-4">
            {lead.activities && lead.activities.length > 0 ? (
              <div className="space-y-2">
                {lead.activities.map((act) => (
                  <Card key={act.id}>
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{act.activityType}</Badge>
                            {act.direction && <span className="text-xs text-muted-foreground">{act.direction}</span>}
                          </div>
                          {act.subject && <p className="text-sm font-medium mt-1">{act.subject}</p>}
                          {act.content && <p className="text-xs text-muted-foreground mt-0.5">{act.content}</p>}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(act.activityDatetime).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-muted-foreground text-sm">No activities recorded</div>
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            {lead.notes && lead.notes.length > 0 ? (
              <div className="space-y-2">
                {lead.notes.map((note) => (
                  <Card key={note.id} className={note.isPinned ? "border-primary/30" : ""}>
                    <CardContent className="pt-3 pb-3">
                      <p className="text-sm text-foreground">{note.noteBody}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {note.noteType} · {new Date(note.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-muted-foreground text-sm">No notes added</div>
            )}
          </TabsContent>

          <TabsContent value="opportunities" className="mt-4">
            {lead.opportunities && lead.opportunities.length > 0 ? (
              <div className="space-y-2">
                {lead.opportunities.map((opp) => (
                  <Card key={opp.id}>
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{opp.opportunityName ?? "Opportunity"}</p>
                          <p className="text-xs text-muted-foreground">
                            {opp.planInterest} · {opp.currency} {Number(opp.amountExpected ?? 0).toLocaleString()}
                          </p>
                        </div>
                        <StatusBadge status={opp.status} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-muted-foreground text-sm">No opportunities linked</div>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            {timeline && timeline.length > 0 ? (
              <div className="space-y-3 relative">
                <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-border" />
                {timeline.map((ev) => (
                  <div key={ev.id} className="flex items-start gap-4 pl-2">
                    <div className="h-3 w-3 rounded-full bg-primary border-2 border-background mt-1 shrink-0 z-10" />
                    <div>
                      <p className="text-xs font-medium text-foreground">{ev.renderedTitle ?? ev.eventType}</p>
                      {ev.renderedDescription && <p className="text-xs text-muted-foreground">{ev.renderedDescription}</p>}
                      <p className="text-xs text-muted-foreground/60 mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(ev.eventTimestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-muted-foreground text-sm">No timeline events</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
