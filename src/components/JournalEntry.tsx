import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { useState } from "react";

interface JournalEntryProps {
  journalText: string;
  onJournalChange: (text: string) => void;
  onSave: () => void;
  className?: string;
}

export const JournalEntry = ({ journalText, onJournalChange, onSave, className }: JournalEntryProps) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave();
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <Card className={`mood-card ${className}`}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Daily Journal</h3>
        <p className="text-sm text-muted-foreground">
          How was your day? Write down your thoughts, feelings, or anything that comes to mind.
        </p>
        
        <Textarea
          value={journalText}
          onChange={(e) => onJournalChange(e.target.value)}
          placeholder="Today I felt..."
          className="min-h-[120px] resize-none border-muted-foreground/20 focus:border-primary"
          rows={5}
        />
        
        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={!journalText.trim() || isSaving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Entry"}
          </Button>
        </div>
      </div>
    </Card>
  );
};