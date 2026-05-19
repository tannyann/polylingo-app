import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { Home } from './components/Home';
import { Onboarding } from './components/Onboarding';
import { PatternLesson } from './components/PatternLesson';
import { ProgressView } from './components/Progress';
import { Review } from './components/Review';
import { ScenarioLesson } from './components/ScenarioLesson';
import { PATTERNS } from './data/patterns';
import { SCENARIOS } from './data/scenarios';
import { tickInvitationNotifications } from './lib/invitationNotifications';
import { loadProfile, loadStats, loadVocab, saveProfile, saveStats, saveVocab, touchRhythm } from './lib/storage';
import { dueCards } from './lib/spacedRepetition';
import type { Screen, SessionStats, UserProfile, VocabCard } from './types';

function App() {
  const [profile, setProfile] = useState<UserProfile | null>(() => loadProfile());
  const [stats, setStats] = useState<SessionStats>(() => loadStats());
  const [vocab, setVocab] = useState<VocabCard[]>(() => loadVocab());
  const [screen, setScreen] = useState<Screen>(() => (loadProfile() ? 'home' : 'onboarding'));
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [activePatternId, setActivePatternId] = useState<string | null>(null);

  const persistStats = useCallback((next: SessionStats) => {
    setStats(next);
    saveStats(next);
  }, []);

  const persistVocab = useCallback((next: VocabCard[]) => {
    setVocab(next);
    saveVocab(next);
  }, []);

  const persistProfile = useCallback((next: UserProfile) => {
    setProfile(next);
    saveProfile(next);
  }, []);

  useEffect(() => {
    if (!profile) return;
    const run = () => tickInvitationNotifications(profile);
    run();
    const id = window.setInterval(run, 60_000);
    return () => window.clearInterval(id);
  }, [profile]);

  function completeOnboarding(nextProfile: UserProfile) {
    saveProfile(nextProfile);
    setProfile(nextProfile);
    persistStats(touchRhythm(stats));
    setScreen('home');
  }

  function handleScenarioComplete(xp: number) {
    if (!activeScenarioId) return;
    const scenario = SCENARIOS.find((candidate) => candidate.id === activeScenarioId);
    const alreadyDone = stats.scenariosCompleted.includes(activeScenarioId);
    persistStats(
      touchRhythm({
        ...stats,
        totalXp: stats.totalXp + xp,
        minutesLearned: stats.minutesLearned + 6,
        scenariosCompleted: alreadyDone ? stats.scenariosCompleted : [...stats.scenariosCompleted, activeScenarioId],
      }),
    );
    if (scenario) {
      const existing = new Set(vocab.map((card) => card.id));
      persistVocab([...vocab, ...scenario.vocab.filter((card) => !existing.has(card.id))]);
    }
    setActiveScenarioId(null);
    setScreen('home');
  }

  function handlePatternComplete(patternId: string, xp: number) {
    const alreadyDone = stats.patternsCompleted.includes(patternId);
    persistStats(
      touchRhythm({
        ...stats,
        totalXp: stats.totalXp + xp,
        minutesLearned: stats.minutesLearned + 4,
        patternsCompleted: alreadyDone ? stats.patternsCompleted : [...stats.patternsCompleted, patternId],
      }),
    );
  }

  const activeScenario = SCENARIOS.find((scenario) => scenario.id === activeScenarioId);
  const activePattern = PATTERNS.find((pattern) => pattern.id === activePatternId);

  if (!profile || screen === 'onboarding') {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  return (
    <>
      {screen === 'home' && (
        <Home
          profile={profile}
          stats={stats}
          vocab={vocab}
          onStartScenario={(id) => {
            setActiveScenarioId(id);
            setScreen('scenario');
            persistStats(touchRhythm(stats));
          }}
          onStartPattern={(id) => {
            setActivePatternId(id);
            setScreen('pattern');
            persistStats(touchRhythm(stats));
          }}
          onReview={() => setScreen('review')}
          onProgress={() => setScreen('progress')}
          onEditProfile={() => setScreen('onboarding')}
          onProfileUpdate={persistProfile}
        />
      )}

      {screen === 'pattern' && activePattern && (
        <PatternLesson
          pattern={activePattern}
          relatedScenarios={SCENARIOS.filter((scenario) => activePattern.scenarioIds.includes(scenario.id))}
          onBack={() => {
            setActivePatternId(null);
            setScreen('home');
          }}
          onComplete={(xp) => handlePatternComplete(activePattern.id, xp)}
          onStartScenario={(id) => {
            setActivePatternId(null);
            setActiveScenarioId(id);
            setScreen('scenario');
          }}
        />
      )}

      {screen === 'scenario' && activeScenario && (
        <ScenarioLesson
          scenario={activeScenario}
          onBack={() => {
            setActiveScenarioId(null);
            setScreen('home');
          }}
          onComplete={handleScenarioComplete}
        />
      )}

      {screen === 'review' && (
        <Review cards={dueCards(vocab)} onBack={() => setScreen('home')} onUpdate={persistVocab} />
      )}

      {screen === 'progress' && (
        <ProgressView profile={profile} stats={stats} vocab={vocab} onBack={() => setScreen('home')} />
      )}
    </>
  );
}

export default App;
