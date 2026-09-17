import { useSearchParams } from 'react-router-dom';
import { PageHero } from '../components/shared';
import { StrategyShowcase } from '../components/StrategyShowcase';

export default function StrategiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || undefined;

  return (
    <>
      <PageHero
        eyebrow="OUR STRATEGIES"
        title={
          <>
            Strategies Built Around{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ink-700 to-accent-600">
              Your Goals
            </span>
          </>
        }
        lead="Purpose-built strategies, united by one investment philosophy."
      />

      <section id="strategies" className="py-20 bg-white font-sans">
        <StrategyShowcase
          eyebrow="OUR STRATEGIES, ONE PHILOSOPHY"
          title="3 Purpose-built portfolio strategies"
          lead="Each strategy is run on the same investment discipline — select a mandate to review its construction, key facts and track record."
          initialTabId={tabFromUrl}
          onTabChange={(id) => setSearchParams({ tab: id }, { replace: true })}
        />
      </section>
    </>
  );
}
