import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import WellnessSurvey from "@/components/WellnessSurvey";
import { Heart, Activity, Calendar, Moon, BookOpen, Briefcase, Smile, Utensils } from "lucide-react";
import { toast } from "sonner";

export default function Wellness() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const fetchProfile = async () => {
    try {
      const data = await api.getWellnessProfile();
      setProfile(data.wellnessProfile);
    } catch (err) {
      toast.error("Failed to load wellness profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleComplete = () => {
    setEditing(false);
    fetchProfile();
  };

  if (loading) {
    return <div className="p-6 md:p-10 text-fog font-thin text-left">Loading wellness profile...</div>;
  }

  if (editing || !profile || !profile.surveyCompleted) {
    return (
      <div className="p-6 md:p-10 space-y-6 text-left">
        <p className="eyebrow text-xs mb-2">Wellness & Burnout Advisor</p>
        <h2 className="display-section mb-6">
          {profile?.surveyCompleted ? "Update Wellness Profile" : "Wellness Setup"}
        </h2>
        <WellnessSurvey 
          onComplete={handleComplete} 
          onSkip={() => {
            if (profile?.surveyCompleted) {
              setEditing(false);
            } else {
              toast.info("Survey skipped. Using baseline defaults.");
              fetchProfile();
            }
          }} 
        />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="eyebrow text-xs mb-2">Wellness & Burnout Advisor</p>
          <h2 className="display-section">My Wellness Profile</h2>
        </div>
        <Button onClick={() => setEditing(true)}>
          Edit Responses
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Semester */}
        <div className="neo-card flex items-start gap-4">
          <BookOpen className="w-8 h-8 p-1.5 text-paper bg-signal rounded-tag shadow-neo mt-1" />
          <div>
            <p className="text-xs text-mist uppercase tracking-wider">Current Year</p>
            <p className="font-display font-semibold text-lg text-paper mt-1">
              {profile.semester ? `Semester ${profile.semester}` : "Not set"}
            </p>
            <p className="text-[10px] text-fog font-thin mt-0.5">
              {profile.semester ? `Year ${Math.ceil(profile.semester / 2)}` : "Baseline defaults applied"}
            </p>
          </div>
        </div>

        {/* Next Exam */}
        <div className="neo-card flex items-start gap-4">
          <Calendar className="w-8 h-8 p-1.5 text-paper bg-signal rounded-tag shadow-neo mt-1" />
          <div>
            <p className="text-xs text-mist uppercase tracking-wider">Next Exam</p>
            <p className="font-display font-semibold text-lg text-paper mt-1">
              {profile.examDate ? new Date(profile.examDate).toLocaleDateString() : "No exams"}
            </p>
            <p className="text-[10px] text-fog font-thin mt-0.5">
              {profile.examDate ? "Exam approaching" : "No active stress window"}
            </p>
          </div>
        </div>

        {/* Sleep Hours */}
        <div className="neo-card flex items-start gap-4">
          <Moon className="w-8 h-8 p-1.5 text-paper bg-signal rounded-tag shadow-neo mt-1" />
          <div>
            <p className="text-xs text-mist uppercase tracking-wider">Baseline Sleep</p>
            <p className="font-display font-semibold text-lg text-paper mt-1">
              {profile.sleepHours} Hours
            </p>
            <p className="text-[10px] text-fog font-thin mt-0.5">
              {profile.sleepHours >= 7 ? "Healthy baseline" : "Below average baseline"}
            </p>
          </div>
        </div>

        {/* Academics/Coding Hours */}
        <div className="neo-card flex items-start gap-4">
          <Activity className="w-8 h-8 p-1.5 text-paper bg-signal rounded-tag shadow-neo mt-1" />
          <div>
            <p className="text-xs text-mist uppercase tracking-wider">Daily Study</p>
            <p className="font-display font-semibold text-lg text-paper mt-1">
              {profile.studyHours} Hours
            </p>
            <p className="text-[10px] text-fog font-thin mt-0.5">
              Academics &amp; coding
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stress Eating & Cravings */}
        <div className="neo-card space-y-4">
          <div className="flex items-center gap-3">
            <Utensils className="w-8 h-8 p-1.5 text-paper bg-signal rounded-tag shadow-neo" />
            <h3 className="font-display font-semibold text-lg text-paper">Stress Eating &amp; Cravings</h3>
          </div>
          <div className="space-y-3 pt-2 text-sm font-thin text-fog">
            <div>
              <p className="text-xs text-mist uppercase tracking-wider mb-1.5">What you do when stressed:</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.stressEatingPattern?.length > 0 ? (
                  profile.stressEatingPattern.map((p, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-[#001533] border border-[#11263b] text-xs text-paper">
                      {p}
                    </span>
                  ))
                ) : (
                  <span className="text-mist">None selected</span>
                )}
              </div>
            </div>
            {profile.stressEatingPattern?.includes("Eat more") && (
              <div className="pt-2">
                <p className="text-xs text-mist uppercase tracking-wider mb-1.5">What you crave:</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.cravingType?.length > 0 ? (
                    profile.cravingType.map((c, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-[#ff4433]/10 border border-[#ff4433]/30 text-xs text-tag-coral font-medium">
                        {c}
                      </span>
                    ))
                  ) : (
                    <span className="text-mist">No specific cravings selected</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Self-rated wellness indicators */}
        <div className="neo-card space-y-4">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 p-1.5 text-paper bg-signal rounded-tag shadow-neo" />
            <h3 className="font-display font-semibold text-lg text-paper">Self-Rated Wellness Indicators</h3>
          </div>
          <div className="space-y-4 pt-2 font-thin text-fog text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-[#11263b]/30">
              <span className="text-mist">Baseline Stress Rating:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-semibold text-paper text-base">
                  {profile.stressLevel} / 5
                </span>
                <span className="text-xl">
                  {profile.stressLevel === 1 && "😊"}
                  {profile.stressLevel === 2 && "🙂"}
                  {profile.stressLevel === 3 && "😐"}
                  {profile.stressLevel === 4 && "😟"}
                  {profile.stressLevel === 5 && "😫"}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-mist">Part-time Job/Internship:</span>
              <span className="font-semibold text-paper">
                {profile.hasJob ? "Yes (Active Alongside Studies)" : "No Job Active"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Check-in History */}
      <div className="neo-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 p-1.5 text-paper bg-signal rounded-tag shadow-neo" />
            <h3 className="font-display font-semibold text-lg text-paper">Daily Check-in History</h3>
          </div>
          <span className="text-xs text-mist font-thin">Last 7 entries</span>
        </div>
        <div className="overflow-x-auto pt-2">
          {profile.dailyCheckins?.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#11263b] text-mist font-thin uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Sleep Hours</th>
                  <th className="py-2.5 px-3">Eating Pattern</th>
                  <th className="py-2.5 px-3">Stress Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#11263b]/30">
                {profile.dailyCheckins.slice(-7).reverse().map((c, idx) => (
                  <tr key={idx} className="hover:bg-[#001533]/20 font-thin text-fog">
                    <td className="py-3 px-3">
                      {new Date(c.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-3 font-semibold text-paper">{c.sleepHours} hrs</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] ${
                        c.eatingPattern === 'Healthy' ? 'bg-[#00cc4b]/10 text-tag-lime border border-[#00cc4b]/20' :
                        c.eatingPattern === 'Ate out' ? 'bg-[#00acfe]/10 text-tag-sky border border-[#00acfe]/20' :
                        c.eatingPattern === 'Skipped meals' ? 'bg-[#ff4433]/10 text-tag-coral border border-[#ff4433]/20' :
                        'bg-[#ff8833]/10 text-tag-tangerine border border-[#ff8833]/20'
                      }`}>
                        {c.eatingPattern}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-display font-semibold text-paper">
                      {c.stressLevel} / 5
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-mist font-thin py-6 text-center">
              No daily check-ins submitted yet. Check in from your Dashboard page!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
